import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, ilike, gte, lte, sql, inArray } from "drizzle-orm";
import { db, jobsTable, employerProfilesTable, applicationsTable } from "@workspace/db";
import { ListJobsQueryParams, CreateJobBody, UpdateJobBody, GetJobParams, UpdateJobParams, DeleteJobParams } from "@workspace/api-zod";
import { requireAuth, requireRole, optionalAuth, type AuthPayload } from "../middlewares/auth";

const router: IRouter = Router();

function buildEmployerSummary(profile: { userId: number; companyName: string | null; logoUrl: string | null; isVerified: boolean; trustScore: number | null; sector: string | null } | null, userId: number) {
  if (!profile) return { id: userId, companyName: "Unknown Company", logoUrl: null, isVerified: false, trustScore: null, sector: null };
  return { id: profile.userId, companyName: profile.companyName ?? "Unknown Company", logoUrl: profile.logoUrl, isVerified: profile.isVerified, trustScore: profile.trustScore, sector: profile.sector };
}

router.get("/jobs", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  const parsed = ListJobsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { visaType, jobType, location, minPay, maxPay, category, isRemote, search, page, limit } = parsed.data;

  const conditions = [eq(jobsTable.status, "ACTIVE")];

  if (jobType) conditions.push(eq(jobsTable.jobType, jobType));
  if (location) conditions.push(ilike(jobsTable.location, `%${location}%`));
  if (minPay !== undefined) conditions.push(gte(jobsTable.payRate, minPay));
  if (maxPay !== undefined) conditions.push(lte(jobsTable.payRate, maxPay));
  if (category) conditions.push(eq(jobsTable.category, category));
  if (isRemote !== undefined) conditions.push(eq(jobsTable.isRemote, isRemote));
  if (search) conditions.push(ilike(jobsTable.title, `%${search}%`));
  if (visaType && visaType !== "ANY") {
    conditions.push(sql`${jobsTable.visaEligible} @> ARRAY[${visaType}]::text[]`);
  }

  const offset = ((page ?? 1) - 1) * (limit ?? 20);
  const pageSize = limit ?? 20;

  const jobs = await db.select().from(jobsTable).where(and(...conditions)).orderBy(jobsTable.isFeatured, jobsTable.createdAt).limit(pageSize).offset(offset);

  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(jobsTable).where(and(...conditions));
  const total = Number(totalResult[0]?.count ?? 0);

  const employerIds = [...new Set(jobs.map(j => j.employerId))];
  let employerProfiles: typeof employerProfilesTable.$inferSelect[] = [];
  if (employerIds.length > 0) {
    employerProfiles = await db.select().from(employerProfilesTable).where(inArray(employerProfilesTable.userId, employerIds));
  }
  const profileMap = new Map(employerProfiles.map(p => [p.userId, p]));

  const result = jobs.map(job => ({
    ...job,
    employer: buildEmployerSummary(profileMap.get(job.employerId) ?? null, job.employerId),
  }));

  res.json({ jobs: result, total, page: page ?? 1, limit: pageSize });
});

router.post("/jobs", requireAuth, requireRole("EMPLOYER"), async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { userId } = (req as Request & { user: AuthPayload }).user;

  const [job] = await db.insert(jobsTable).values({ ...parsed.data, employerId: userId }).returning();

  const [profile] = await db.select().from(employerProfilesTable).where(eq(employerProfilesTable.userId, userId));
  res.status(201).json({ ...job, employer: buildEmployerSummary(profile ?? null, userId) });
});

router.get("/jobs/:id", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const [profile] = await db.select().from(employerProfilesTable).where(eq(employerProfilesTable.userId, job.employerId));

  const appCountResult = await db.select({ count: sql<number>`count(*)` }).from(applicationsTable).where(eq(applicationsTable.jobId, job.id));
  const applicationCount = Number(appCountResult[0]?.count ?? 0);

  const user = (req as Request & { user?: AuthPayload }).user;
  let hasApplied = false;
  let visaEligibilityStatus: string | null = null;

  if (user) {
    const [existing] = await db.select().from(applicationsTable).where(and(eq(applicationsTable.jobId, job.id), eq(applicationsTable.studentId, user.userId)));
    hasApplied = !!existing;
  }

  res.json({
    ...job,
    employer: buildEmployerSummary(profile ?? null, job.employerId),
    applicationCount,
    hasApplied,
    visaEligibilityStatus,
  });
});

router.put("/jobs/:id", requireAuth, requireRole("EMPLOYER"), async (req: Request, res: Response): Promise<void> => {
  const params = UpdateJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { userId } = (req as Request & { user: AuthPayload }).user;

  const [existing] = await db.select().from(jobsTable).where(and(eq(jobsTable.id, params.data.id), eq(jobsTable.employerId, userId)));
  if (!existing) {
    res.status(404).json({ error: "Job not found or not authorized" });
    return;
  }

  const [job] = await db.update(jobsTable).set(parsed.data).where(eq(jobsTable.id, params.data.id)).returning();
  const [profile] = await db.select().from(employerProfilesTable).where(eq(employerProfilesTable.userId, userId));
  res.json({ ...job, employer: buildEmployerSummary(profile ?? null, userId) });
});

router.delete("/jobs/:id", requireAuth, requireRole("EMPLOYER", "ADMIN"), async (req: Request, res: Response): Promise<void> => {
  const params = DeleteJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { userId } = (req as Request & { user: AuthPayload }).user;

  const [existing] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!existing || (existing.employerId !== userId && (req as Request & { user: AuthPayload }).user.role !== "ADMIN")) {
    res.status(404).json({ error: "Job not found or not authorized" });
    return;
  }

  await db.delete(jobsTable).where(eq(jobsTable.id, params.data.id));
  res.json({ message: "Job deleted" });
});

export default router;

import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, ilike, gte, lte, sql } from "drizzle-orm";
import { db, microInternshipsTable, microApplicationsTable, employerProfilesTable, notificationsTable } from "@workspace/db";
import {
  ListMicroInternshipsQueryParams, CreateMicroInternshipBody,
  GetMicroInternshipParams, ApplyToMicroInternshipParams, ApplyToMicroInternshipBody,
  UpdateMicroApplicationParams, UpdateMicroApplicationBody,
} from "@workspace/api-zod";
import { requireAuth, requireRole, optionalAuth, type AuthPayload } from "../middlewares/auth";

const router: IRouter = Router();

function buildEmployerSummary(profile: { userId: number; companyName: string | null; logoUrl: string | null; isVerified: boolean; trustScore: number | null; sector: string | null } | null, userId: number) {
  if (!profile) return { id: userId, companyName: "Unknown Company", logoUrl: null, isVerified: false, trustScore: null, sector: null };
  return { id: profile.userId, companyName: profile.companyName ?? "Unknown Company", logoUrl: profile.logoUrl, isVerified: profile.isVerified, trustScore: profile.trustScore, sector: profile.sector };
}

router.get("/micro-internships", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  const parsed = ListMicroInternshipsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search, minBudget, maxBudget, page, limit } = parsed.data;

  const conditions = [eq(microInternshipsTable.status, "OPEN")];
  if (search) conditions.push(ilike(microInternshipsTable.title, `%${search}%`));
  if (minBudget !== undefined) conditions.push(gte(microInternshipsTable.budget, minBudget));
  if (maxBudget !== undefined) conditions.push(lte(microInternshipsTable.budget, maxBudget));

  const pageSize = limit ?? 20;
  const offset = ((page ?? 1) - 1) * pageSize;

  const items = await db.select().from(microInternshipsTable).where(and(...conditions)).limit(pageSize).offset(offset).orderBy(microInternshipsTable.createdAt);
  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(microInternshipsTable).where(and(...conditions));
  const total = Number(totalResult[0]?.count ?? 0);

  const employerIds = [...new Set(items.map(m => m.employerId))];
  const profiles: typeof employerProfilesTable.$inferSelect[] = [];
  for (const eid of employerIds) {
    const [p] = await db.select().from(employerProfilesTable).where(eq(employerProfilesTable.userId, eid));
    if (p) profiles.push(p);
  }
  const profileMap = new Map(profiles.map(p => [p.userId, p]));

  const result = items.map(item => ({ ...item, employer: buildEmployerSummary(profileMap.get(item.employerId) ?? null, item.employerId) }));
  res.json({ items: result, total, page: page ?? 1, limit: pageSize });
});

router.post("/micro-internships", requireAuth, requireRole("EMPLOYER"), async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateMicroInternshipBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { userId } = (req as Request & { user: AuthPayload }).user;
  const platformFee = parsed.data.budget * 0.2;

  const [micro] = await db.insert(microInternshipsTable).values({
    ...parsed.data,
    employerId: userId,
    platformFee,
  }).returning();

  const [profile] = await db.select().from(employerProfilesTable).where(eq(employerProfilesTable.userId, userId));
  res.status(201).json({ ...micro, employer: buildEmployerSummary(profile ?? null, userId) });
});

router.get("/micro-internships/:id", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  const params = GetMicroInternshipParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [micro] = await db.select().from(microInternshipsTable).where(eq(microInternshipsTable.id, params.data.id));
  if (!micro) {
    res.status(404).json({ error: "Micro-internship not found" });
    return;
  }

  const [profile] = await db.select().from(employerProfilesTable).where(eq(employerProfilesTable.userId, micro.employerId));
  res.json({ ...micro, employer: buildEmployerSummary(profile ?? null, micro.employerId) });
});

router.post("/micro-internships/:id/apply", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const params = ApplyToMicroInternshipParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = ApplyToMicroInternshipBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { userId } = (req as Request & { user: AuthPayload }).user;

  const [micro] = await db.select().from(microInternshipsTable).where(eq(microInternshipsTable.id, params.data.id));
  if (!micro) {
    res.status(404).json({ error: "Micro-internship not found" });
    return;
  }

  const [app] = await db.insert(microApplicationsTable).values({
    microId: params.data.id,
    studentId: userId,
    proposal: parsed.data.proposal,
    proposedBudget: parsed.data.proposedBudget ?? null,
    status: "PENDING",
  }).returning();

  await db.insert(notificationsTable).values({
    userId: micro.employerId,
    title: "New Micro-Internship Application",
    message: `You received a proposal for "${micro.title}"`,
    link: `/employer/applications`,
  });

  res.status(201).json(app);
});

router.put("/micro-internships/:id/applications/:appId", requireAuth, requireRole("EMPLOYER"), async (req: Request, res: Response): Promise<void> => {
  const params = UpdateMicroApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateMicroApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { userId } = (req as Request & { user: AuthPayload }).user;

  const [micro] = await db.select().from(microInternshipsTable).where(and(eq(microInternshipsTable.id, params.data.id), eq(microInternshipsTable.employerId, userId)));
  if (!micro) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [app] = await db.update(microApplicationsTable).set({ status: parsed.data.status }).where(eq(microApplicationsTable.id, params.data.appId)).returning();

  if (app) {
    await db.insert(notificationsTable).values({
      userId: app.studentId,
      title: "Micro-Internship Update",
      message: `Your proposal for "${micro.title}" has been ${parsed.data.status.toLowerCase()}`,
      link: `/applications`,
    });
  }

  res.json(app);
});

export default router;

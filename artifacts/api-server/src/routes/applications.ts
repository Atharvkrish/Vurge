import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import { db, applicationsTable, jobsTable, usersTable, studentProfilesTable, employerProfilesTable, notificationsTable } from "@workspace/db";
import { ApplyToJobBody, ApplyToJobParams, UpdateApplicationParams, UpdateApplicationBody } from "@workspace/api-zod";
import { requireAuth, type AuthPayload } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/jobs/:id/apply", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const params = ApplyToJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = ApplyToJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { userId } = (req as Request & { user: AuthPayload }).user;

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const [existing] = await db.select().from(applicationsTable).where(and(eq(applicationsTable.jobId, params.data.id), eq(applicationsTable.studentId, userId)));
  if (existing) {
    res.status(409).json({ error: "Already applied to this job" });
    return;
  }

  const [application] = await db.insert(applicationsTable).values({
    jobId: params.data.id,
    studentId: userId,
    coverLetter: parsed.data.coverLetter ?? null,
    status: "PENDING",
  }).returning();

  // Notify employer
  await db.insert(notificationsTable).values({
    userId: job.employerId,
    title: "New Application",
    message: `You received a new application for "${job.title}"`,
    link: `/employer/applications`,
  });

  res.status(201).json(application);
});

router.get("/applications", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId, role } = (req as Request & { user: AuthPayload }).user;

  if (role === "STUDENT") {
    const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.studentId, userId)).orderBy(applicationsTable.appliedAt);
    const jobIds = [...new Set(apps.map(a => a.jobId))];

    const jobs: typeof jobsTable.$inferSelect[] = [];
    for (const jid of jobIds) {
      const [j] = await db.select().from(jobsTable).where(eq(jobsTable.id, jid));
      if (j) jobs.push(j);
    }

    const employerIds = [...new Set(jobs.map(j => j.employerId))];
    const profiles: typeof employerProfilesTable.$inferSelect[] = [];
    for (const eid of employerIds) {
      const [p] = await db.select().from(employerProfilesTable).where(eq(employerProfilesTable.userId, eid));
      if (p) profiles.push(p);
    }
    const profileMap = new Map(profiles.map(p => [p.userId, p]));
    const jobMap = new Map(jobs.map(j => [j.id, j]));

    const result = apps.map(app => {
      const job = jobMap.get(app.jobId);
      return {
        ...app,
        job: job ? { ...job, employer: { id: job.employerId, companyName: profileMap.get(job.employerId)?.companyName ?? "Unknown", logoUrl: profileMap.get(job.employerId)?.logoUrl ?? null, isVerified: profileMap.get(job.employerId)?.isVerified ?? false, trustScore: profileMap.get(job.employerId)?.trustScore ?? null, sector: profileMap.get(job.employerId)?.sector ?? null } } : null,
        student: null,
      };
    });
    res.json(result);
    return;
  }

  // Employer: get all applications for their jobs
  const myJobs = await db.select().from(jobsTable).where(eq(jobsTable.employerId, userId));
  const jobIds = myJobs.map(j => j.id);
  if (jobIds.length === 0) {
    res.json([]);
    return;
  }

  const allApps: typeof applicationsTable.$inferSelect[] = [];
  for (const jid of jobIds) {
    const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.jobId, jid));
    allApps.push(...apps);
  }

  const studentIds = [...new Set(allApps.map(a => a.studentId))];
  const studentProfiles: typeof studentProfilesTable.$inferSelect[] = [];
  const studentUsers: typeof usersTable.$inferSelect[] = [];
  for (const sid of studentIds) {
    const [u] = await db.select().from(usersTable).where(eq(usersTable.id, sid));
    if (u) studentUsers.push(u);
    const [sp] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, sid));
    if (sp) studentProfiles.push(sp);
  }
  const userMap = new Map(studentUsers.map(u => [u.id, u]));
  const spMap = new Map(studentProfiles.map(sp => [sp.userId, sp]));
  const jobMap = new Map(myJobs.map(j => [j.id, j]));

  const result = allApps.map(app => {
    const u = userMap.get(app.studentId);
    const sp = spMap.get(app.studentId);
    const job = jobMap.get(app.jobId);
    return {
      ...app,
      student: u ? { id: u.id, name: u.name, email: u.email, university: sp?.university ?? null, visaType: sp?.visaType ?? null, skills: sp?.skills ?? [] } : null,
      job: job ? { ...job, employer: { id: job.employerId, companyName: "My Company", logoUrl: null, isVerified: false, trustScore: null, sector: null } } : null,
    };
  });

  res.json(result);
});

router.put("/applications/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const params = UpdateApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { userId, role } = (req as Request & { user: AuthPayload }).user;

  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, params.data.id));
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  if (role === "STUDENT" && app.studentId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (role === "EMPLOYER") {
    const [job] = await db.select().from(jobsTable).where(and(eq(jobsTable.id, app.jobId), eq(jobsTable.employerId, userId)));
    if (!job) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
  }

  const [updated] = await db.update(applicationsTable).set({ status: parsed.data.status }).where(eq(applicationsTable.id, params.data.id)).returning();

  // Notify student of status change
  if (role === "EMPLOYER") {
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
    await db.insert(notificationsTable).values({
      userId: app.studentId,
      title: "Application Update",
      message: `Your application for "${job?.title ?? "a job"}" has been updated to ${parsed.data.status}`,
      link: `/applications`,
    });
  }

  res.json(updated);
});

export default router;

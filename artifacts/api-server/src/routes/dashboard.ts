import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, applicationsTable, jobsTable, microInternshipsTable, notificationsTable, cvDataTable, employerProfilesTable, studentProfilesTable } from "@workspace/db";
import { requireAuth, type AuthPayload } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/student", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as Request & { user: AuthPayload }).user;

  const allApps = await db.select().from(applicationsTable).where(eq(applicationsTable.studentId, userId));

  const totalApplications = allApps.length;
  const pendingApplications = allApps.filter(a => a.status === "PENDING").length;
  const shortlistedApplications = allApps.filter(a => a.status === "SHORTLISTED").length;
  const hiredApplications = allApps.filter(a => a.status === "HIRED").length;

  const recentApps = allApps.slice(-5).reverse();
  const recentJobIds = [...new Set(recentApps.map(a => a.jobId))];
  const recentJobs: typeof jobsTable.$inferSelect[] = [];
  const recentEmployerProfiles: typeof employerProfilesTable.$inferSelect[] = [];

  for (const jid of recentJobIds) {
    const [j] = await db.select().from(jobsTable).where(eq(jobsTable.id, jid));
    if (j) {
      recentJobs.push(j);
      const [p] = await db.select().from(employerProfilesTable).where(eq(employerProfilesTable.userId, j.employerId));
      if (p) recentEmployerProfiles.push(p);
    }
  }
  const profileMap = new Map(recentEmployerProfiles.map(p => [p.userId, p]));
  const jobMap = new Map(recentJobs.map(j => [j.id, j]));

  const recentApplications = recentApps.map(app => {
    const job = jobMap.get(app.jobId);
    const profile = job ? profileMap.get(job.employerId) : null;
    return {
      ...app,
      job: job ? { ...job, employer: { id: job.employerId, companyName: profile?.companyName ?? "Unknown", logoUrl: profile?.logoUrl ?? null, isVerified: profile?.isVerified ?? false, trustScore: profile?.trustScore ?? null, sector: profile?.sector ?? null } } : null,
      student: null,
    };
  });

  // Matching jobs based on student's visa type
  const [sp] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, userId));
  let matchingJobs: typeof jobsTable.$inferSelect[] = [];
  if (sp?.visaType) {
    const rawJobs = await db.select().from(jobsTable).where(and(eq(jobsTable.status, "ACTIVE"), sql`${jobsTable.visaEligible} @> ARRAY[${sp.visaType}]::text[]`)).limit(6);
    const empIds = [...new Set(rawJobs.map(j => j.employerId))];
    const empProfiles: typeof employerProfilesTable.$inferSelect[] = [];
    for (const eid of empIds) {
      const [p] = await db.select().from(employerProfilesTable).where(eq(employerProfilesTable.userId, eid));
      if (p) empProfiles.push(p);
    }
    const empMap = new Map(empProfiles.map(p => [p.userId, p]));
    matchingJobs = rawJobs.map(j => ({ ...j, employer: { id: j.employerId, companyName: empMap.get(j.employerId)?.companyName ?? "Unknown", logoUrl: empMap.get(j.employerId)?.logoUrl ?? null, isVerified: empMap.get(j.employerId)?.isVerified ?? false, trustScore: empMap.get(j.employerId)?.trustScore ?? null, sector: empMap.get(j.employerId)?.sector ?? null } } as typeof jobsTable.$inferSelect));
  } else {
    matchingJobs = await db.select().from(jobsTable).where(eq(jobsTable.status, "ACTIVE")).limit(6);
  }

  const [cv] = await db.select().from(cvDataTable).where(eq(cvDataTable.studentId, userId));

  const unreadCount = await db.select({ count: sql<number>`count(*)` }).from(notificationsTable).where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.read, false)));

  res.json({
    totalApplications,
    pendingApplications,
    shortlistedApplications,
    hiredApplications,
    recentApplications,
    matchingJobs,
    unreadNotifications: Number(unreadCount[0]?.count ?? 0),
    cvScore: cv?.aiScore ?? null,
  });
});

router.get("/dashboard/employer", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as Request & { user: AuthPayload }).user;

  const myJobs = await db.select().from(jobsTable).where(eq(jobsTable.employerId, userId));
  const totalJobs = myJobs.length;
  const activeJobs = myJobs.filter(j => j.status === "ACTIVE").length;

  const jobIds = myJobs.map(j => j.id);
  let allApps: typeof applicationsTable.$inferSelect[] = [];
  for (const jid of jobIds) {
    const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.jobId, jid));
    allApps.push(...apps);
  }

  const totalApplications = allApps.length;
  const pendingApplications = allApps.filter(a => a.status === "PENDING").length;

  const recentApps = allApps.slice(-5).reverse();
  const recentApplications = recentApps.map(app => {
    const job = myJobs.find(j => j.id === app.jobId);
    return {
      ...app,
      job: job ? { ...job, employer: { id: userId, companyName: "My Company", logoUrl: null, isVerified: false, trustScore: null, sector: null } } : null,
      student: null,
    };
  });

  const topJobs = myJobs.slice(0, 5).map(j => ({ ...j, employer: { id: userId, companyName: "My Company", logoUrl: null, isVerified: false, trustScore: null, sector: null } }));

  const unreadCount = await db.select({ count: sql<number>`count(*)` }).from(notificationsTable).where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.read, false)));

  res.json({
    totalJobs,
    activeJobs,
    totalApplications,
    pendingApplications,
    recentApplications,
    topJobs,
    unreadNotifications: Number(unreadCount[0]?.count ?? 0),
  });
});

export default router;

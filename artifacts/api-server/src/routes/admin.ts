import { Router, type IRouter, type Request, type Response } from "express";
import { eq, sql } from "drizzle-orm";
import { db, usersTable, jobsTable, applicationsTable, microInternshipsTable, employerProfilesTable, studentProfilesTable } from "@workspace/db";
import { ListAdminUsersQueryParams, VerifyEmployerParams } from "@workspace/api-zod";
import { requireAuth, requireRole, type AuthPayload } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/stats", requireAuth, requireRole("ADMIN"), async (req: Request, res: Response): Promise<void> => {
  const usersResult = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
  const studentsResult = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "STUDENT"));
  const employersResult = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "EMPLOYER"));
  const jobsResult = await db.select({ count: sql<number>`count(*)` }).from(jobsTable);
  const appsResult = await db.select({ count: sql<number>`count(*)` }).from(applicationsTable);
  const microsResult = await db.select({ count: sql<number>`count(*)` }).from(microInternshipsTable);
  const unverifiedResult = await db.select({ count: sql<number>`count(*)` }).from(employerProfilesTable).where(eq(employerProfilesTable.isVerified, false));

  res.json({
    totalUsers: Number(usersResult[0]?.count ?? 0),
    totalStudents: Number(studentsResult[0]?.count ?? 0),
    totalEmployers: Number(employersResult[0]?.count ?? 0),
    totalJobs: Number(jobsResult[0]?.count ?? 0),
    totalApplications: Number(appsResult[0]?.count ?? 0),
    totalMicroInternships: Number(microsResult[0]?.count ?? 0),
    unverifiedEmployers: Number(unverifiedResult[0]?.count ?? 0),
  });
});

router.get("/admin/users", requireAuth, requireRole("ADMIN"), async (req: Request, res: Response): Promise<void> => {
  const parsed = ListAdminUsersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { role, page } = parsed.data;
  const pageSize = 20;
  const offset = ((page ?? 1) - 1) * pageSize;

  const conditions = role ? [eq(usersTable.role, role)] : [];
  const users = conditions.length > 0
    ? await db.select().from(usersTable).where(conditions[0]).limit(pageSize).offset(offset)
    : await db.select().from(usersTable).limit(pageSize).offset(offset);

  const totalResult = conditions.length > 0
    ? await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(conditions[0])
    : await db.select({ count: sql<number>`count(*)` }).from(usersTable);
  const total = Number(totalResult[0]?.count ?? 0);

  const result = await Promise.all(users.map(async user => {
    let studentProfile = null;
    let employerProfile = null;
    if (user.role === "STUDENT") {
      const [sp] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, user.id));
      studentProfile = sp ?? null;
    } else if (user.role === "EMPLOYER") {
      const [ep] = await db.select().from(employerProfilesTable).where(eq(employerProfilesTable.userId, user.id));
      employerProfile = ep ?? null;
    }
    return { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt, studentProfile, employerProfile };
  }));

  res.json({ users: result, total, page: page ?? 1 });
});

router.post("/admin/employers/:id/verify", requireAuth, requireRole("ADMIN"), async (req: Request, res: Response): Promise<void> => {
  const params = VerifyEmployerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.update(employerProfilesTable).set({ isVerified: true }).where(eq(employerProfilesTable.userId, params.data.id));
  res.json({ message: "Employer verified successfully" });
});

export default router;

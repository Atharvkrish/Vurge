import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db, usersTable, studentProfilesTable, employerProfilesTable } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { signToken, requireAuth } from "../middlewares/auth";
import { type AuthPayload } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req: Request, res: Response): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password, name, role } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({ email, passwordHash, name, role }).returning();

  if (role === "STUDENT") {
    await db.insert(studentProfilesTable).values({ userId: user.id });
  } else if (role === "EMPLOYER") {
    await db.insert(employerProfilesTable).values({ userId: user.id });
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.status(201).json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified, createdAt: user.createdAt },
    token,
  });
});

router.post("/auth/login", async (req: Request, res: Response): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified, createdAt: user.createdAt },
    token,
  });
});

router.post("/auth/logout", async (_req: Request, res: Response): Promise<void> => {
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId, role } = (req as Request & { user: AuthPayload }).user;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  let studentProfile = null;
  let employerProfile = null;

  if (role === "STUDENT") {
    const [sp] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, userId));
    studentProfile = sp ?? null;
  } else if (role === "EMPLOYER") {
    const [ep] = await db.select().from(employerProfilesTable).where(eq(employerProfilesTable.userId, userId));
    employerProfile = ep ?? null;
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    studentProfile,
    employerProfile,
  });
});

router.put("/auth/profile", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId, role } = (req as Request & { user: AuthPayload }).user;
  const body = req.body as Record<string, unknown>;

  if (body.name) {
    await db.update(usersTable).set({ name: body.name as string }).where(eq(usersTable.id, userId));
  }

  if (role === "STUDENT") {
    const updateData: Record<string, unknown> = {};
    if (body.university !== undefined) updateData.university = body.university;
    if (body.course !== undefined) updateData.course = body.course;
    if (body.graduationYear !== undefined) updateData.graduationYear = body.graduationYear;
    if (body.visaType !== undefined) updateData.visaType = body.visaType;
    if (body.visaExpiryDate !== undefined) updateData.visaExpiryDate = body.visaExpiryDate;
    if (body.skills !== undefined) updateData.skills = body.skills;
    if (body.bio !== undefined) updateData.bio = body.bio;

    if (Object.keys(updateData).length > 0) {
      await db.update(studentProfilesTable).set(updateData).where(eq(studentProfilesTable.userId, userId));
    }
  } else if (role === "EMPLOYER") {
    const updateData: Record<string, unknown> = {};
    if (body.companyName !== undefined) updateData.companyName = body.companyName;
    if (body.companyRegistration !== undefined) updateData.companyRegistration = body.companyRegistration;
    if (body.taxId !== undefined) updateData.taxId = body.taxId;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.sector !== undefined) updateData.sector = body.sector;
    if (body.employeeCount !== undefined) updateData.employeeCount = body.employeeCount;
    if (body.description !== undefined) updateData.description = body.description;

    if (Object.keys(updateData).length > 0) {
      await db.update(employerProfilesTable).set(updateData).where(eq(employerProfilesTable.userId, userId));
    }
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  let studentProfile = null;
  let employerProfile = null;

  if (role === "STUDENT") {
    const [sp] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, userId));
    studentProfile = sp ?? null;
  } else if (role === "EMPLOYER") {
    const [ep] = await db.select().from(employerProfilesTable).where(eq(employerProfilesTable.userId, userId));
    employerProfile = ep ?? null;
  }

  res.json({ id: user.id, email: user.email, name: user.name, role: user.role, studentProfile, employerProfile });
});

export default router;

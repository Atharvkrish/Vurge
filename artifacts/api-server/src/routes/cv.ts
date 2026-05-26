import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, cvDataTable, jobsTable } from "@workspace/db";
import { SaveCvBody, ScoreCvQueryParams } from "@workspace/api-zod";
import { requireAuth, type AuthPayload } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/cv", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as Request & { user: AuthPayload }).user;
  const [cv] = await db.select().from(cvDataTable).where(eq(cvDataTable.studentId, userId));
  if (!cv) {
    res.status(404).json({ error: "No CV found" });
    return;
  }
  res.json(cv);
});

router.post("/cv", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const parsed = SaveCvBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { userId } = (req as Request & { user: AuthPayload }).user;

  const existing = await db.select().from(cvDataTable).where(eq(cvDataTable.studentId, userId));
  let cv;
  if (existing.length > 0) {
    [cv] = await db.update(cvDataTable).set({ parsedJson: parsed.data.parsedJson }).where(eq(cvDataTable.studentId, userId)).returning();
  } else {
    [cv] = await db.insert(cvDataTable).values({ studentId: userId, parsedJson: parsed.data.parsedJson }).returning();
  }
  res.json(cv);
});

router.get("/cv/score", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const parsed = ScoreCvQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { userId } = (req as Request & { user: AuthPayload }).user;

  const [cv] = await db.select().from(cvDataTable).where(eq(cvDataTable.studentId, userId));
  if (!cv) {
    res.status(404).json({ error: "No CV found. Please save your CV first." });
    return;
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, parsed.data.jobId));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  // Simple scoring without OpenAI - compute based on skills overlap
  try {
    const cvData = cv.parsedJson as { skills?: string[]; experience?: unknown[]; education?: unknown[] } | null;
    const cvSkills: string[] = (cvData?.skills ?? []).map((s: string) => s.toLowerCase());
    const jobDescription = (job.description ?? "").toLowerCase();
    const jobTitle = job.title.toLowerCase();
    const jobCategory = (job.category ?? "").toLowerCase();

    let score = 30;
    const tips: string[] = [];
    const strengths: string[] = [];

    if (cvSkills.length > 0) {
      const matchedSkills = cvSkills.filter(skill => jobDescription.includes(skill) || jobTitle.includes(skill) || jobCategory.includes(skill));
      const skillScore = Math.min(40, (matchedSkills.length / Math.max(cvSkills.length, 1)) * 60);
      score += skillScore;
      if (matchedSkills.length > 0) {
        strengths.push(`You have ${matchedSkills.length} matching skill(s): ${matchedSkills.slice(0, 3).join(", ")}`);
      } else {
        tips.push("Add skills that match the job description to improve your score");
      }
    } else {
      tips.push("Add relevant skills to your CV to match job requirements");
    }

    if (cvData?.experience && Array.isArray(cvData.experience) && cvData.experience.length > 0) {
      score += 15;
      strengths.push("You have work experience which employers value");
    } else {
      tips.push("Add work experience, internships, or volunteer work to strengthen your application");
    }

    if (cvData?.education && Array.isArray(cvData.education) && cvData.education.length > 0) {
      score += 15;
      strengths.push("Your education background is included in your CV");
    } else {
      tips.push("Include your educational qualifications and any relevant courses");
    }

    if (tips.length === 0) tips.push("Tailor your cover letter to highlight your most relevant experience for this specific role");

    score = Math.min(100, Math.round(score));

    await db.update(cvDataTable).set({ aiScore: score }).where(eq(cvDataTable.studentId, userId));

    res.json({ score, tips, strengths });
  } catch (err) {
    logger.error({ err }, "CV scoring failed");
    res.json({ score: 50, tips: ["Unable to compute detailed score at this time. Please try again."], strengths: [] });
  }
});

export default router;

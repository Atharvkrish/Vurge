import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import { MarkNotificationReadParams } from "@workspace/api-zod";
import { requireAuth, type AuthPayload } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/notifications", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as Request & { user: AuthPayload }).user;
  const notifications = await db.select().from(notificationsTable).where(eq(notificationsTable.userId, userId)).orderBy(notificationsTable.createdAt);
  res.json(notifications);
});

router.patch("/notifications/:id/read", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const params = MarkNotificationReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { userId } = (req as Request & { user: AuthPayload }).user;

  const [notification] = await db.update(notificationsTable)
    .set({ read: true })
    .where(and(eq(notificationsTable.id, params.data.id), eq(notificationsTable.userId, userId)))
    .returning();

  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json(notification);
});

router.patch("/notifications/read-all", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as Request & { user: AuthPayload }).user;
  await db.update(notificationsTable).set({ read: true }).where(eq(notificationsTable.userId, userId));
  res.json({ message: "All notifications marked as read" });
});

export default router;

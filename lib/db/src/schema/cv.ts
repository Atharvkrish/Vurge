import { pgTable, text, serial, timestamp, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const cvDataTable = pgTable("cv_data", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  parsedJson: jsonb("parsed_json"),
  aiScore: real("ai_score"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCvDataSchema = createInsertSchema(cvDataTable).omit({ id: true, updatedAt: true });
export type InsertCvData = z.infer<typeof insertCvDataSchema>;
export type CvData = typeof cvDataTable.$inferSelect;

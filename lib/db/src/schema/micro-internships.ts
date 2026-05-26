import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const microInternshipsTable = pgTable("micro_internships", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  duration: text("duration"),
  budget: real("budget").notNull(),
  platformFee: real("platform_fee").notNull().default(0),
  skills: text("skills").array().notNull().default([]),
  deadline: timestamp("deadline", { withTimezone: true }),
  status: text("status").notNull().default("OPEN"), // OPEN | IN_PROGRESS | COMPLETED | CANCELLED
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const microApplicationsTable = pgTable("micro_applications", {
  id: serial("id").primaryKey(),
  microId: integer("micro_id").notNull().references(() => microInternshipsTable.id, { onDelete: "cascade" }),
  studentId: integer("student_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  proposal: text("proposal"),
  proposedBudget: real("proposed_budget"),
  status: text("status").notNull().default("PENDING"), // PENDING | ACCEPTED | REJECTED | COMPLETED
  appliedAt: timestamp("applied_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertMicroInternshipSchema = createInsertSchema(microInternshipsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMicroInternship = z.infer<typeof insertMicroInternshipSchema>;
export type MicroInternship = typeof microInternshipsTable.$inferSelect;

export const insertMicroApplicationSchema = createInsertSchema(microApplicationsTable).omit({ id: true, appliedAt: true, updatedAt: true });
export type InsertMicroApplication = z.infer<typeof insertMicroApplicationSchema>;
export type MicroApplication = typeof microApplicationsTable.$inferSelect;

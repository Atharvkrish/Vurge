import { pgTable, text, serial, timestamp, boolean, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  jobType: text("job_type").notNull(), // PART_TIME | FULL_TIME | INTERNSHIP | FREELANCE
  visaEligible: text("visa_eligible").array().notNull().default([]),
  hoursPerWeek: real("hours_per_week"),
  payRate: real("pay_rate"),
  payPeriod: text("pay_period"), // HOURLY | WEEKLY | MONTHLY
  location: text("location"),
  isRemote: boolean("is_remote").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  status: text("status").notNull().default("ACTIVE"), // ACTIVE | CLOSED | DRAFT
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;

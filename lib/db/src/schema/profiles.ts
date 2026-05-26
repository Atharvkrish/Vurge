import { pgTable, text, serial, timestamp, boolean, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const studentProfilesTable = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  university: text("university"),
  course: text("course"),
  graduationYear: integer("graduation_year"),
  visaType: text("visa_type"), // STAMP_2 | STAMP_1G | GRADUATE_VISA | STUDENT_VISA
  visaExpiryDate: text("visa_expiry_date"), // stored as ISO date string
  skills: text("skills").array().notNull().default([]),
  bio: text("bio"),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const employerProfilesTable = pgTable("employer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  companyName: text("company_name"),
  companyRegistration: text("company_registration"),
  taxId: text("tax_id"),
  website: text("website"),
  logoUrl: text("logo_url"),
  sector: text("sector"),
  employeeCount: text("employee_count"),
  isVerified: boolean("is_verified").notNull().default(false),
  trustScore: real("trust_score"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStudentProfileSchema = createInsertSchema(studentProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type StudentProfile = typeof studentProfilesTable.$inferSelect;

export const insertEmployerProfileSchema = createInsertSchema(employerProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEmployerProfile = z.infer<typeof insertEmployerProfileSchema>;
export type EmployerProfile = typeof employerProfilesTable.$inferSelect;

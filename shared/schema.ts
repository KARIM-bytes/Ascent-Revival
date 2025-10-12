import { pgTable, serial, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Students table
export const students = pgTable("Students", {
  id: serial("id").primaryKey(),
  rollNo: varchar("rollNo", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  year: varchar("year", { length: 50 }).notNull(),
  department: varchar("department", { length: 255 }).notNull(),
  fcmToken: text("fcmToken"),
  pushNotifications: boolean("pushNotifications").default(true),
  emailNotifications: boolean("emailNotifications").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Coordinators table
export const coordinators = pgTable("Coordinators", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).default("Coordinator"),
  department: varchar("department", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const insertCoordinatorSchema = createInsertSchema(coordinators).omit({
  id: true,
  createdAt: true,
});

export type InsertCoordinator = z.infer<typeof insertCoordinatorSchema>;
export type Coordinator = typeof coordinators.$inferSelect;

// Jobs table
export const jobs = pgTable("Job", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  description: text("description").notNull(),
  skills: text("skills").array().notNull(),
  deadline: timestamp("deadline").notNull(),
  targetYears: text("targetYears").array().notNull(),
  targetDepts: text("targetDepts").array().notNull(),
  mandatory: boolean("mandatory").default(false),
  externalLink: text("externalLink").notNull(),
  location: varchar("location", { length: 255 }),
  ctc: varchar("ctc", { length: 100 }),
  postedBy: integer("postedBy").notNull(),
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

// Applications table
export const applications = pgTable("Application", {
  id: serial("id").primaryKey(),
  studentId: integer("studentId").notNull(),
  jobId: integer("jobId").notNull(),
  status: varchar("status", { length: 50 }).default("Applied"),
  notes: text("notes"),
  deletedAt: timestamp("deletedAt"),
  appliedAt: timestamp("appliedAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
  updatedAt: true,
  deletedAt: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

// SavedJob table
export const savedJobs = pgTable("SavedJob", {
  id: serial("id").primaryKey(),
  studentId: integer("studentId").notNull(),
  jobId: integer("jobId").notNull(),
  savedAt: timestamp("savedAt").defaultNow(),
});

export const insertSavedJobSchema = createInsertSchema(savedJobs).omit({
  id: true,
  savedAt: true,
});

export type InsertSavedJob = z.infer<typeof insertSavedJobSchema>;
export type SavedJob = typeof savedJobs.$inferSelect;

// OTP table
export const otps = pgTable("OTP", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  otp: varchar("otp", { length: 6 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const insertOTPSchema = createInsertSchema(otps).omit({
  id: true,
  createdAt: true,
});

export type InsertOTP = z.infer<typeof insertOTPSchema>;
export type OTP = typeof otps.$inferSelect;

// AuditLog table
export const auditLogs = pgTable("AuditLog", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  userType: varchar("userType", { length: 50 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 50 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

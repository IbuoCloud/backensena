import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Project schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  clientName: text("client_name"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("active"), // active, completed, on-hold, cancelled
  progress: integer("progress").notNull().default(0),
  teamId: integer("team_id"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
}).extend({
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  teamId: z.number().optional(),
});

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  projectId: integer("project_id").notNull(),
  status: text("status").notNull().default("todo"), // todo, in-progress, review, completed
  priority: text("priority").notNull().default("medium"), // low, medium, high
  assigneeId: integer("assignee_id"),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").notNull().default(false),
  column: text("column").notNull().default("todo"), // Used for kanban view: todo, in-progress, review, completed
  order: integer("order").notNull().default(0), // Used for ordering in kanban
  timeSpent: integer("time_spent").default(0), // In minutes
  timeEstimate: integer("time_estimate"), // In minutes
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
}).extend({
  dueDate: z.coerce.date().optional(),
});

// Team member schema
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  email: text("email").notNull(),
  avatarUrl: text("avatar_url"),
  teamId: integer("team_id"),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
});

// Teams schema
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  avatarUrl: text("avatar_url"),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
});

// Project milestones
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
}).extend({
  date: z.coerce.date(),
});

// Events/calendar items
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  start: timestamp("start").notNull(),
  end: timestamp("end"),
  allDay: boolean("all_day").notNull().default(false),
  projectId: integer("project_id"),
  type: text("type").notNull().default("meeting"), // meeting, deadline, milestone, etc.
  color: text("color").default("blue"),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
}).extend({
  start: z.coerce.date(),
  end: z.coerce.date().optional(),
});

// Export types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

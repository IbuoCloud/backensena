import 'dotenv/config';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { Pool } from 'pg';
import { neon } from '@neondatabase/serverless';
import { IStorage } from './storage';
import {
  projects, type Project, type InsertProject,
  tasks, type Task, type InsertTask,
  teamMembers, type TeamMember, type InsertTeamMember,
  milestones, type Milestone, type InsertMilestone,
  events, type Event, type InsertEvent,
  teams, type Team, type InsertTeam,
} from '@shared/schema';
import { eq } from 'drizzle-orm';

let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Valor por defecto para entorno de desarrollo
  databaseUrl = "postgres://postgres:postgres@localhost:5432/project_tracker_pro";
  console.warn("[WARN] DATABASE_URL no definida. Usando valor por defecto de desarrollo: " + databaseUrl);
}

// Tipo genérico para evitar errores de inferencia cruzada entre drivers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any;

// Si la URL apunta a un host de Neon (*.neon.tech o *.neon-cloud.dev, etc.), usa el driver HTTP.
if (/\.neon\.tech|\.neoncloud\./.test(databaseUrl)) {
  const sql = neon(databaseUrl);
  db = drizzleNeon(sql);
} else {
  // Caso por defecto: Postgres local o cualquier instancia TCP estándar
  const pool = new Pool({ connectionString: databaseUrl });
  db = drizzlePg(pool);
}

export class DbStorage implements IStorage {
  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const results = await db.select().from(projects).where(eq(projects.id, id));
    return results[0];
  }

  async createProject(project: InsertProject): Promise<Project> {
    const results = await db.insert(projects).values(project).returning();
    return results[0];
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project | undefined> {
    const results = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return results[0];
  }

  async deleteProject(id: number): Promise<boolean> {
    const results = await db.delete(projects).where(eq(projects.id, id)).returning();
    return results.length > 0;
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const results = await db.select().from(tasks).where(eq(tasks.id, id));
    return results[0];
  }

  async createTask(task: InsertTask): Promise<Task> {
    const results = await db.insert(tasks).values(task).returning();
    return results[0];
  }

  async updateTask(id: number, task: Partial<Task>): Promise<Task | undefined> {
    const results = await db
      .update(tasks)
      .set(task)
      .where(eq(tasks.id, id))
      .returning();
    return results[0];
  }

  async deleteTask(id: number): Promise<boolean> {
    const results = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return results.length > 0;
  }

  async moveTask(id: number, column: string, order: number): Promise<Task | undefined> {
    return this.updateTask(id, { column, order });
  }

  // Team member operations
  async getTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers);
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    const results = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return results[0];
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const results = await db.insert(teamMembers).values(member).returning();
    return results[0];
  }

  async updateTeamMember(id: number, member: Partial<TeamMember>): Promise<TeamMember | undefined> {
    const results = await db
      .update(teamMembers)
      .set(member)
      .where(eq(teamMembers.id, id))
      .returning();
    return results[0];
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    const results = await db.delete(teamMembers).where(eq(teamMembers.id, id)).returning();
    return results.length > 0;
  }

  // Teams operations
  async getTeams(): Promise<Team[]> {
    return await db.select().from(teams);
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const results = await db.select().from(teams).where(eq(teams.id, id));
    return results[0];
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const results = await db.insert(teams).values(team).returning();
    return results[0];
  }

  async updateTeam(id: number, team: Partial<Team>): Promise<Team | undefined> {
    const results = await db.update(teams).set(team).where(eq(teams.id, id)).returning();
    return results[0];
  }

  async deleteTeam(id: number): Promise<boolean> {
    const results = await db.delete(teams).where(eq(teams.id, id)).returning();
    return results.length > 0;
  }

  // Milestone operations
  async getMilestones(): Promise<Milestone[]> {
    return await db.select().from(milestones);
  }

  async getMilestonesByProject(projectId: number): Promise<Milestone[]> {
    return await db.select().from(milestones).where(eq(milestones.projectId, projectId));
  }

  async getMilestone(id: number): Promise<Milestone | undefined> {
    const results = await db.select().from(milestones).where(eq(milestones.id, id));
    return results[0];
  }

  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const results = await db.insert(milestones).values(milestone).returning();
    return results[0];
  }

  async updateMilestone(id: number, milestone: Partial<Milestone>): Promise<Milestone | undefined> {
    const results = await db
      .update(milestones)
      .set(milestone)
      .where(eq(milestones.id, id))
      .returning();
    return results[0];
  }

  async deleteMilestone(id: number): Promise<boolean> {
    const results = await db.delete(milestones).where(eq(milestones.id, id)).returning();
    return results.length > 0;
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEventsByProject(projectId: number): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.projectId, projectId));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const results = await db.select().from(events).where(eq(events.id, id));
    return results[0];
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const results = await db.insert(events).values(event).returning();
    return results[0];
  }

  async updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined> {
    const results = await db
      .update(events)
      .set(event)
      .where(eq(events.id, id))
      .returning();
    return results[0];
  }

  async deleteEvent(id: number): Promise<boolean> {
    const results = await db.delete(events).where(eq(events.id, id)).returning();
    return results.length > 0;
  }

  // Stats operations
  async getProjectStats(): Promise<{
    activeProjects: number;
    completedProjects: number;
    pendingTasks: number;
    completedTasks: number;
    timeSpent: number;
    productivity: number;
  }> {
    const [projects, tasks] = await Promise.all([
      this.getProjects(),
      this.getTasks()
    ]);

    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const timeSpent = tasks.reduce((acc, task) => acc + (task.timeSpent || 0), 0);
    const totalTasks = pendingTasks + completedTasks;
    const productivity = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      activeProjects,
      completedProjects,
      pendingTasks,
      completedTasks,
      timeSpent,
      productivity
    };
  }
} 
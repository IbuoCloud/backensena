import { type Express } from "express";
import { createServer, type Server } from "http";
import { DbStorage } from "./db";
import { 
  insertProjectSchema, 
  insertTaskSchema,
  insertTeamMemberSchema,
  insertMilestoneSchema,
  insertEventSchema,
  insertTeamSchema
} from "@shared/schema";
import { z } from "zod";

const storage = new DbStorage();

console.log("[DEBUG] server/routes.ts cargado");

export async function registerRoutes(app: Express): Promise<Server> {
  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Error fetching project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating project" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    console.log("[DEBUG] handler PUT /api/projects/:id ejecutándose");
    const id = parseInt(req.params.id);
    // Log inicial fuera de try
    console.log("[DEBUG] PUT /api/projects/:id llamado", { id, body: req.body });
    try {
      // Copia y sanea datos entrantes
      const incomingRaw = req.body as Record<string, any>;

      // Convertir strings ISO a Date
      if (incomingRaw.startDate && typeof incomingRaw.startDate === "string") {
        incomingRaw.startDate = new Date(incomingRaw.startDate);
      }
      if (incomingRaw.endDate && typeof incomingRaw.endDate === "string") {
        incomingRaw.endDate = new Date(incomingRaw.endDate);
      }

      // Parsear números que llegan como string
      if (typeof incomingRaw.teamId === "string") {
        incomingRaw.teamId = incomingRaw.teamId === "" ? null : Number(incomingRaw.teamId);
      }
      if (typeof incomingRaw.progress === "string") {
        incomingRaw.progress = Number(incomingRaw.progress);
      }

      // Saneado extra: asegurar que status es string y progress es número
      if (incomingRaw.status && typeof incomingRaw.status !== "string") {
        incomingRaw.status = String(incomingRaw.status);
      }
      if (incomingRaw.progress && typeof incomingRaw.progress !== "number") {
        incomingRaw.progress = Number(incomingRaw.progress);
      }

      // Quitar claves con undefined
      const incoming: Record<string, any> = {};
      for (const [k, v] of Object.entries(incomingRaw)) {
        if (v !== undefined) incoming[k] = v;
      }

      console.log("[DEBUG] Campos sanitizados", incoming);

      const project = await storage.updateProject(id, incoming);
      console.log("[DEBUG] Resultado updateProject", project);

      if (!project) {
        console.error("[ERROR] Project not found tras update", { id, incoming });
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      console.error("[ERROR] updating project (catch)", error, { id, body: req.body });
      res.status(500).json({ message: "Error updating project", error: (error as Error).message });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting project" });
    }
  });

  // Tasks routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      
      let tasks;
      if (projectId) {
        tasks = await storage.getTasksByProject(projectId);
      } else {
        tasks = await storage.getTasks();
      }
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Error fetching task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating task" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.updateTask(id, req.body);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Error updating task" });
    }
  });

  app.post("/api/tasks/:id/move", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      let { column, order } = req.body;

      // asegurar valores válidos
      const allowedColumns = ["todo", "in-progress", "review", "completed"];
      if (!allowedColumns.includes(column)) {
        // Si el front envía algo extraño (por ejemplo un id numérico), mantenemos la columna actual
        const current = await storage.getTask(id);
        column = current?.column ?? "todo";
      }

      if (typeof order !== "number") order = 0;

      const task = await storage.moveTask(id, column, order);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Error moving task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting task" });
    }
  });

  // Team members routes
  app.get("/api/team", async (req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Error fetching team members" });
    }
  });

  app.get("/api/team/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const member = await storage.getTeamMember(id);
      
      if (!member) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Error fetching team member" });
    }
  });

  app.post("/api/team", async (req, res) => {
    try {
      const member = await storage.createTeamMember(req.body);
      res.status(201).json(member);
    } catch (error) {
      res.status(500).json({ message: "Error creating team member" });
    }
  });

  app.put("/api/team/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const member = await storage.updateTeamMember(id, req.body);
      
      if (!member) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Error updating team member" });
    }
  });

  // También aceptar PATCH para actualización parcial de miembro
  app.patch("/api/team/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const member = await storage.updateTeamMember(id, req.body);
      if (!member) {
        return res.status(404).json({ message: "Team member not found" });
      }
      res.json(member);
    } catch (_error) {
      res.status(500).json({ message: "Error updating team member" });
    }
  });

  app.delete("/api/team/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTeamMember(id);
      
      if (!success) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting team member" });
    }
  });

  // Teams routes
  app.get("/api/teams", async (_req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (_error) {
      res.status(500).json({ message: "Error fetching teams" });
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const team = await storage.getTeam(id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(team);
    } catch (_error) {
      res.status(500).json({ message: "Error fetching team" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const teamData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(teamData);
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid team data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating team" });
    }
  });

  app.patch("/api/teams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const team = await storage.updateTeam(id, req.body);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(team);
    } catch (_error) {
      res.status(500).json({ message: "Error updating team" });
    }
  });

  app.delete("/api/teams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTeam(id);
      if (!success) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.status(204).end();
    } catch (_error) {
      res.status(500).json({ message: "Error deleting team" });
    }
  });

  // Milestones routes
  app.get("/api/milestones", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      
      let milestones;
      if (projectId) {
        milestones = await storage.getMilestonesByProject(projectId);
      } else {
        milestones = await storage.getMilestones();
      }
      
      res.json(milestones);
    } catch (error) {
      res.status(500).json({ message: "Error fetching milestones" });
    }
  });

  app.get("/api/milestones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const milestone = await storage.getMilestone(id);
      
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      res.json(milestone);
    } catch (error) {
      res.status(500).json({ message: "Error fetching milestone" });
    }
  });

  app.post("/api/milestones", async (req, res) => {
    try {
      const milestoneData = insertMilestoneSchema.parse(req.body);
      const milestone = await storage.createMilestone(milestoneData);
      res.status(201).json(milestone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid milestone data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating milestone" });
    }
  });

  app.patch("/api/milestones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const milestone = await storage.updateMilestone(id, req.body);
      
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      res.json(milestone);
    } catch (error) {
      res.status(500).json({ message: "Error updating milestone" });
    }
  });

  app.delete("/api/milestones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMilestone(id);
      
      if (!success) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting milestone" });
    }
  });

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      
      let events;
      if (projectId) {
        events = await storage.getEventsByProject(projectId);
      } else {
        events = await storage.getEvents();
      }
      
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Error fetching event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating event" });
    }
  });

  app.patch("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.updateEvent(id, req.body);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Error updating event" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEvent(id);
      
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting event" });
    }
  });

  // Project stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getProjectStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching project stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

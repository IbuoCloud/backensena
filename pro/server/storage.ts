import { 
  projects, type Project, type InsertProject,
  tasks, type Task, type InsertTask,
  teamMembers, type TeamMember, type InsertTeamMember,
  milestones, type Milestone, type InsertMilestone,
  events, type Event, type InsertEvent
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Task operations
  getTasks(): Promise<Task[]>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  moveTask(id: number, column: string, order: number): Promise<Task | undefined>;

  // Team member operations
  getTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, member: Partial<TeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: number): Promise<boolean>;

  // Milestone operations
  getMilestones(): Promise<Milestone[]>;
  getMilestonesByProject(projectId: number): Promise<Milestone[]>;
  getMilestone(id: number): Promise<Milestone | undefined>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: number, milestone: Partial<Milestone>): Promise<Milestone | undefined>;
  deleteMilestone(id: number): Promise<boolean>;

  // Event operations
  getEvents(): Promise<Event[]>;
  getEventsByProject(projectId: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;

  // Stats operations
  getProjectStats(): Promise<{
    activeProjects: number;
    completedProjects: number;
    pendingTasks: number;
    completedTasks: number;
    timeSpent: number;
    productivity: number;
  }>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private projectsData: Map<number, Project>;
  private tasksData: Map<number, Task>;
  private teamMembersData: Map<number, TeamMember>;
  private milestonesData: Map<number, Milestone>;
  private eventsData: Map<number, Event>;

  private projectIdCounter: number;
  private taskIdCounter: number;
  private teamMemberIdCounter: number;
  private milestoneIdCounter: number;
  private eventIdCounter: number;

  constructor() {
    this.projectsData = new Map();
    this.tasksData = new Map();
    this.teamMembersData = new Map();
    this.milestonesData = new Map();
    this.eventsData = new Map();

    this.projectIdCounter = 1;
    this.taskIdCounter = 1;
    this.teamMemberIdCounter = 1;
    this.milestoneIdCounter = 1;
    this.eventIdCounter = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projectsData.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projectsData.get(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const newProject: Project = { ...project, id };
    this.projectsData.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project | undefined> {
    const existingProject = this.projectsData.get(id);
    if (!existingProject) return undefined;

    const updatedProject = { ...existingProject, ...project };
    this.projectsData.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projectsData.delete(id);
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasksData.values());
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return Array.from(this.tasksData.values()).filter(
      (task) => task.projectId === projectId
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasksData.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const newTask: Task = { 
      ...task, 
      id, 
      createdAt: new Date() 
    };
    this.tasksData.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, task: Partial<Task>): Promise<Task | undefined> {
    const existingTask = this.tasksData.get(id);
    if (!existingTask) return undefined;

    const updatedTask = { ...existingTask, ...task };
    this.tasksData.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasksData.delete(id);
  }

  async moveTask(id: number, column: string, order: number): Promise<Task | undefined> {
    const task = this.tasksData.get(id);
    if (!task) return undefined;

    const updatedTask: Task = { ...task, column, order };
    this.tasksData.set(id, updatedTask);
    return updatedTask;
  }

  // Team member operations
  async getTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembersData.values());
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.teamMembersData.get(id);
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const id = this.teamMemberIdCounter++;
    const newMember: TeamMember = { ...member, id };
    this.teamMembersData.set(id, newMember);
    return newMember;
  }

  async updateTeamMember(id: number, member: Partial<TeamMember>): Promise<TeamMember | undefined> {
    const existingMember = this.teamMembersData.get(id);
    if (!existingMember) return undefined;

    const updatedMember = { ...existingMember, ...member };
    this.teamMembersData.set(id, updatedMember);
    return updatedMember;
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    return this.teamMembersData.delete(id);
  }

  // Milestone operations
  async getMilestones(): Promise<Milestone[]> {
    return Array.from(this.milestonesData.values());
  }

  async getMilestonesByProject(projectId: number): Promise<Milestone[]> {
    return Array.from(this.milestonesData.values()).filter(
      (milestone) => milestone.projectId === projectId
    );
  }

  async getMilestone(id: number): Promise<Milestone | undefined> {
    return this.milestonesData.get(id);
  }

  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const id = this.milestoneIdCounter++;
    const newMilestone: Milestone = { ...milestone, id };
    this.milestonesData.set(id, newMilestone);
    return newMilestone;
  }

  async updateMilestone(id: number, milestone: Partial<Milestone>): Promise<Milestone | undefined> {
    const existingMilestone = this.milestonesData.get(id);
    if (!existingMilestone) return undefined;

    const updatedMilestone = { ...existingMilestone, ...milestone };
    this.milestonesData.set(id, updatedMilestone);
    return updatedMilestone;
  }

  async deleteMilestone(id: number): Promise<boolean> {
    return this.milestonesData.delete(id);
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return Array.from(this.eventsData.values());
  }

  async getEventsByProject(projectId: number): Promise<Event[]> {
    return Array.from(this.eventsData.values()).filter(
      (event) => event.projectId === projectId
    );
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.eventsData.get(id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const newEvent: Event = { ...event, id };
    this.eventsData.set(id, newEvent);
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined> {
    const existingEvent = this.eventsData.get(id);
    if (!existingEvent) return undefined;

    const updatedEvent = { ...existingEvent, ...event };
    this.eventsData.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.eventsData.delete(id);
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
    const projects = Array.from(this.projectsData.values());
    const tasks = Array.from(this.tasksData.values());

    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const completedTasks = tasks.filter(t => t.completed).length;
    
    // Calculate total time spent on tasks (in minutes)
    const timeSpent = tasks.reduce((acc, task) => acc + (task.timeSpent || 0), 0);
    
    // Calculate productivity (completed tasks / total tasks) * 100
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

  private initializeSampleData() {
    // Add team members
    const team = [
      { 
        id: this.teamMemberIdCounter++, 
        name: "Ana Martínez", 
        role: "Gerente de Proyectos", 
        email: "ana.martinez@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"
      },
      { 
        id: this.teamMemberIdCounter++, 
        name: "Carlos García", 
        role: "Desarrollador Frontend", 
        email: "carlos.garcia@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"
      },
      { 
        id: this.teamMemberIdCounter++, 
        name: "Laura Rodríguez", 
        role: "Diseñadora UX/UI", 
        email: "laura.rodriguez@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"
      },
      { 
        id: this.teamMemberIdCounter++, 
        name: "David López", 
        role: "Desarrollador Backend", 
        email: "david.lopez@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"
      },
      { 
        id: this.teamMemberIdCounter++, 
        name: "Sofia Hernández", 
        role: "QA Analyst", 
        email: "sofia.hernandez@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"
      }
    ];

    team.forEach(member => {
      this.teamMembersData.set(member.id, member);
    });

    // Add projects
    const projects = [
      {
        id: this.projectIdCounter++,
        name: "Rediseño de Plataforma Web",
        description: "Modernización y rediseño de la plataforma web para mejorar la experiencia de usuario y aumentar conversiones.",
        clientName: "WebDesign Inc.",
        startDate: new Date("2023-09-15"),
        endDate: new Date("2023-11-15"),
        status: "active",
        progress: 75,
      },
      {
        id: this.projectIdCounter++,
        name: "Aplicación Móvil v2.0",
        description: "Desarrollo de nueva versión de la aplicación móvil con funcionalidades mejoradas y diseño actualizado.",
        clientName: "TechMobile S.A.",
        startDate: new Date("2023-09-01"),
        endDate: new Date("2023-11-30"),
        status: "active",
        progress: 45,
      },
      {
        id: this.projectIdCounter++,
        name: "Plataforma E-commerce",
        description: "Implementación de tienda en línea con pasarela de pago integrada y gestión de inventario.",
        clientName: "ShopTech Inc.",
        startDate: new Date("2023-09-05"),
        endDate: new Date("2023-10-10"),
        status: "active",
        progress: 90,
      }
    ];

    projects.forEach(project => {
      this.projectsData.set(project.id, project);
    });

    // Add tasks
    const tasks = [
      // Project 1 Tasks
      {
        id: this.taskIdCounter++,
        title: "Crear mockups para página principal",
        description: "Diseñar las maquetas de la página de inicio con el nuevo estilo.",
        projectId: 1,
        status: "todo",
        priority: "high",
        assigneeId: 3,
        dueDate: new Date("2023-10-15"),
        completed: false,
        column: "todo",
        order: 0,
        timeSpent: 0,
        timeEstimate: 480,
        createdAt: new Date("2023-10-01")
      },
      {
        id: this.taskIdCounter++,
        title: "Configurar sistema de autenticación",
        description: "Implementar login y registro de usuarios con validación.",
        projectId: 1,
        status: "todo",
        priority: "medium",
        assigneeId: 5,
        dueDate: new Date("2023-10-18"),
        completed: false,
        column: "todo",
        order: 1,
        timeSpent: 0,
        timeEstimate: 360,
        createdAt: new Date("2023-10-01")
      },
      {
        id: this.taskIdCounter++,
        title: "Crear API para gestión de usuarios",
        description: "Desarrollar endpoints para CRUD de perfiles de usuario.",
        projectId: 1,
        status: "todo",
        priority: "medium",
        assigneeId: 4,
        dueDate: new Date("2023-10-20"),
        completed: false,
        column: "todo",
        order: 2,
        timeSpent: 0,
        timeEstimate: 420,
        createdAt: new Date("2023-10-01")
      },
      {
        id: this.taskIdCounter++,
        title: "Implementar componentes responsive",
        description: "Crear grid y componentes adaptables para móviles y tablets.",
        projectId: 1,
        status: "in-progress",
        priority: "high",
        assigneeId: 2,
        dueDate: new Date("2023-10-14"),
        completed: false,
        column: "in-progress",
        order: 0,
        timeSpent: 180,
        timeEstimate: 360,
        createdAt: new Date("2023-09-25")
      },
      {
        id: this.taskIdCounter++,
        title: "Diseño del sistema de filtros",
        description: "Crear componentes para filtrar productos y resultados de búsqueda.",
        projectId: 1,
        status: "in-progress",
        priority: "medium",
        assigneeId: 3,
        dueDate: new Date("2023-10-12"),
        completed: false,
        column: "in-progress",
        order: 1,
        timeSpent: 240,
        timeEstimate: 300,
        createdAt: new Date("2023-09-28")
      },
      {
        id: this.taskIdCounter++,
        title: "Optimizar consultas a la base de datos",
        description: "Revisar y mejorar rendimiento de las consultas principales.",
        projectId: 1,
        status: "in-progress",
        priority: "medium",
        assigneeId: 4,
        dueDate: new Date("2023-10-15"),
        completed: false,
        column: "in-progress",
        order: 2,
        timeSpent: 120,
        timeEstimate: 240,
        createdAt: new Date("2023-09-30")
      },
      {
        id: this.taskIdCounter++,
        title: "Pruebas de usabilidad",
        description: "Realizar pruebas con usuarios y documentar resultados.",
        projectId: 1,
        status: "review",
        priority: "high",
        assigneeId: 1,
        dueDate: new Date("2023-10-13"),
        completed: false,
        column: "review",
        order: 0,
        timeSpent: 300,
        timeEstimate: 480,
        createdAt: new Date("2023-09-20")
      },
      {
        id: this.taskIdCounter++,
        title: "Integración de pasarela de pagos",
        description: "Implementar Stripe y PayPal para procesar pagos.",
        projectId: 1,
        status: "review",
        priority: "high",
        assigneeId: 4,
        dueDate: new Date("2023-10-11"),
        completed: false,
        column: "review",
        order: 1,
        timeSpent: 280,
        timeEstimate: 360,
        createdAt: new Date("2023-09-22")
      },
      {
        id: this.taskIdCounter++,
        title: "Configuración inicial del proyecto",
        description: "Crear repositorio, configurar entorno y dependencias.",
        projectId: 1,
        status: "completed",
        priority: "high",
        assigneeId: 2,
        dueDate: new Date("2023-10-05"),
        completed: true,
        column: "completed",
        order: 0,
        timeSpent: 120,
        timeEstimate: 120,
        createdAt: new Date("2023-09-15")
      },
      {
        id: this.taskIdCounter++,
        title: "Definición de arquitectura",
        description: "Documentar estructura del proyecto y tecnologías a utilizar.",
        projectId: 1,
        status: "completed",
        priority: "high",
        assigneeId: 4,
        dueDate: new Date("2023-10-07"),
        completed: true,
        column: "completed",
        order: 1,
        timeSpent: 180,
        timeEstimate: 240,
        createdAt: new Date("2023-09-17")
      },

      // Project 2 Tasks
      {
        id: this.taskIdCounter++,
        title: "Diseño de interfaz de usuario",
        description: "Diseñar todas las pantallas de la aplicación móvil",
        projectId: 2,
        status: "in-progress",
        priority: "high",
        assigneeId: 3,
        dueDate: new Date("2023-10-20"),
        completed: false,
        column: "in-progress",
        order: 0,
        timeSpent: 600,
        timeEstimate: 1200,
        createdAt: new Date("2023-09-10")
      },
      {
        id: this.taskIdCounter++,
        title: "Implementación de notificaciones push",
        description: "Integrar sistema de notificaciones para alertas en tiempo real",
        projectId: 2,
        status: "todo",
        priority: "medium",
        assigneeId: 2,
        dueDate: new Date("2023-11-05"),
        completed: false,
        column: "todo",
        order: 0,
        timeSpent: 0,
        timeEstimate: 480,
        createdAt: new Date("2023-09-15")
      },

      // Project 3 Tasks
      {
        id: this.taskIdCounter++,
        title: "Configuración de pasarela de pagos",
        description: "Integrar Stripe como sistema principal de pagos",
        projectId: 3,
        status: "completed",
        priority: "high",
        assigneeId: 4,
        dueDate: new Date("2023-10-05"),
        completed: true,
        column: "completed",
        order: 0,
        timeSpent: 420,
        timeEstimate: 480,
        createdAt: new Date("2023-09-20")
      },
      {
        id: this.taskIdCounter++,
        title: "Desarrollo de catálogo de productos",
        description: "Implementar pantallas de listado y detalle de productos",
        projectId: 3,
        status: "in-progress",
        priority: "high",
        assigneeId: 2,
        dueDate: new Date("2023-10-08"),
        completed: false,
        column: "in-progress",
        order: 0,
        timeSpent: 720,
        timeEstimate: 960,
        createdAt: new Date("2023-09-25")
      }
    ];

    tasks.forEach(task => {
      this.tasksData.set(task.id, task);
    });

    // Add milestones
    const milestones = [
      {
        id: this.milestoneIdCounter++,
        projectId: 1,
        title: "Entrega de Diseños",
        date: new Date("2023-10-14"),
        completed: false
      },
      {
        id: this.milestoneIdCounter++,
        projectId: 1,
        title: "Revisión de Prototipo",
        date: new Date("2023-10-28"),
        completed: false
      },
      {
        id: this.milestoneIdCounter++,
        projectId: 1,
        title: "Lanzamiento",
        date: new Date("2023-11-11"),
        completed: false
      },
      {
        id: this.milestoneIdCounter++,
        projectId: 2,
        title: "Beta Testing",
        date: new Date("2023-11-15"),
        completed: false
      },
      {
        id: this.milestoneIdCounter++,
        projectId: 3,
        title: "Lanzamiento Tienda Online",
        date: new Date("2023-10-30"),
        completed: false
      }
    ];

    milestones.forEach(milestone => {
      this.milestonesData.set(milestone.id, milestone);
    });

    // Add events
    const events = [
      {
        id: this.eventIdCounter++,
        title: "Entrega de E-commerce",
        description: "Fecha límite para entrega del proyecto e-commerce",
        start: new Date("2023-10-30T09:00:00"),
        end: new Date("2023-10-30T10:00:00"),
        allDay: false,
        projectId: 3,
        type: "deadline",
        color: "red"
      },
      {
        id: this.eventIdCounter++,
        title: "Reunión con clientes",
        description: "Presentación de avances del rediseño web",
        start: new Date("2023-10-26T14:30:00"),
        end: new Date("2023-10-26T16:00:00"),
        allDay: false,
        projectId: 1,
        type: "meeting",
        color: "blue"
      },
      {
        id: this.eventIdCounter++,
        title: "Revisión de sprints",
        description: "Evaluación del progreso y planificación",
        start: new Date("2023-10-16T11:00:00"),
        end: new Date("2023-10-16T12:30:00"),
        allDay: false,
        projectId: 1,
        type: "meeting",
        color: "amber"
      }
    ];

    events.forEach(event => {
      this.eventsData.set(event.id, event);
    });
  }
}

export const storage = new MemStorage();

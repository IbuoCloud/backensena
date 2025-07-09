import { useState } from "react";
import DashboardHeader from "@/components/layout/dashboard-header";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import KanbanBoard from "@/components/tasks/kanban-board";
import GanttChart from "@/components/projects/gantt-chart";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import { useTeamMembers } from "@/hooks/use-team";
import { useTeams } from "@/hooks/use-teams";
import { useMilestones } from "@/hooks/use-project-stats";
import { formatDate } from "@/lib/utils";
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  Download, 
  FileText, 
  Grid, 
  LayoutDashboard, 
  List, 
  Users 
} from "lucide-react";
import { Dialog as UIDialog, DialogContent as UIDialogContent, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle, DialogDescription as UIDialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { TeamMember } from "@shared/schema";
import CreateTaskDialog from "@/components/tasks/create-task-dialog";

interface ProjectDetailProps {
  id: number;
}

export default function ProjectDetail({ id }: ProjectDetailProps) {
  const { project, isLoading } = useProject(id);
  const updateProject = useUpdateProject(id);
  const { milestones } = useMilestones(id);
  const { teamMembers, getTeamMembersByIds } = useTeamMembers();
  const { teams } = useTeams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const getProjectMembers = () => {
    if (!project?.teamId) return [];
    return getTeamMembersByIds(
      teamMembers.filter((m: TeamMember) => m.teamId === project.teamId).map((m: TeamMember) => m.id)
    );
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!project?.endDate) return "Sin fecha límite";
    
    const today = new Date();
    const endDate = new Date(project.endDate);
    
    if (endDate < today) return "Vencido";
    
    const diffTime = Math.abs(endDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} días restantes`;
  };

  if (isLoading || !project) {
    return (
      <>
        <DashboardHeader title="Cargando proyecto..." />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6 pb-20 md:pb-6">
          <div className="h-64 flex items-center justify-center">
            <p>Cargando detalles del proyecto...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardHeader title={project.name} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6 pb-20 md:pb-6">
        {/* Project Overview Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
                <p className="text-slate-500">{project.clientName}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="text-slate-700">
                  <Clock className="mr-1.5 h-4 w-4" /> Registrar tiempo
                </Button>
                <Button variant="outline" className="text-slate-700">
                  <FileText className="mr-1.5 h-4 w-4" /> Generar informe
                </Button>
                <Button variant="outline" className="text-slate-700">
                  <Download className="mr-1.5 h-4 w-4" /> Exportar
                </Button>
                <Button onClick={() => setCreateTaskOpen(true)}>
                  <CheckSquare className="mr-1.5 h-4 w-4" /> Nueva tarea
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Estado</h3>
                <div className="text-lg font-semibold text-slate-900 capitalize">
                  {project.status === "active" ? "En progreso" : 
                   project.status === "completed" ? "Completado" : 
                   project.status === "on-hold" ? "En pausa" : "Cancelado"}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Progreso</h3>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold text-slate-900">{project.progress}%</div>
                  <Progress value={project.progress} className="h-2 flex-1" />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Fecha límite</h3>
                <div className="text-lg font-semibold text-slate-900">
                  {project.endDate ? formatDate(new Date(project.endDate)) : "No definida"}
                </div>
                <div className="text-xs text-slate-500">
                  {getDaysRemaining()}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Equipo</h3>
                <div className="flex items-center gap-2">
                  <AvatarGroup items={getProjectMembers()} />
                  <Button variant="ghost" size="sm" className="h-7 ml-2 text-primary text-xs" onClick={() => { setSelectedTeamId(String(project.teamId ?? "none")); setAssignDialogOpen(true); }}>
                    {project.teamId ? "Cambiar" : "Asignar"}
                  </Button>
                </div>
              </div>
            </div>
            
            {project.description && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Descripción</h3>
                <p className="text-slate-700">{project.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Project Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="bg-white p-1 rounded-lg border border-slate-200 inline-block">
            <TabsList className="grid grid-cols-5 h-9 rounded-md bg-slate-100">
              <TabsTrigger value="overview" className="rounded-sm text-xs md:text-sm">
                <LayoutDashboard className="h-4 w-4 mr-1.5 md:mr-2" />
                <span className="hidden md:inline">Panel</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-sm text-xs md:text-sm">
                <CheckSquare className="h-4 w-4 mr-1.5 md:mr-2" />
                <span className="hidden md:inline">Tareas</span>
              </TabsTrigger>
              <TabsTrigger value="gantt" className="rounded-sm text-xs md:text-sm">
                <Grid className="h-4 w-4 mr-1.5 md:mr-2" />
                <span className="hidden md:inline">Cronograma</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="rounded-sm text-xs md:text-sm">
                <Users className="h-4 w-4 mr-1.5 md:mr-2" />
                <span className="hidden md:inline">Equipo</span>
              </TabsTrigger>
              <TabsTrigger value="files" className="rounded-sm text-xs md:text-sm">
                <List className="h-4 w-4 mr-1.5 md:mr-2" />
                <span className="hidden md:inline">Archivos</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen de Tareas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <KanbanBoard projectId={id} />
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Hitos del Proyecto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {milestones.length > 0 ? (
                      <div className="space-y-4">
                        {milestones.map((milestone) => (
                          <div key={milestone.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg">
                            <div className="w-2 h-8 rounded-full bg-primary flex-shrink-0"></div>
                            <div>
                              <h4 className="font-medium text-slate-900">{milestone.title}</h4>
                              <p className="text-xs text-slate-500 flex items-center mt-1">
                                <Calendar className="mr-1 h-3 w-3" />
                                {formatDate(new Date(milestone.date))}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500">
                        No hay hitos definidos
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <GanttChart projectId={id} />
          </TabsContent>
          
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Tareas del Proyecto</CardTitle>
                <CardDescription>
                  Administre las tareas y su estado de progreso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KanbanBoard projectId={id} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="gantt">
            <GanttChart projectId={id} />
          </TabsContent>
          
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Equipo del Proyecto</CardTitle>
                <CardDescription>
                  Miembros del equipo asignados a este proyecto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getProjectMembers().map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-4 border rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatarUrl ?? undefined} alt={member.name} />
                        <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-slate-900">{member.name}</h4>
                        <p className="text-sm text-slate-500">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Archivos del Proyecto</CardTitle>
                <CardDescription>
                  Documentos y archivos relacionados con el proyecto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="h-16 w-16 text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No hay archivos</h3>
                  <p className="text-slate-500 mb-4 max-w-md">
                    Sube documentos, imágenes u otros archivos para compartir con el equipo del proyecto.
                  </p>
                  <Button>Subir archivos</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Dialog para asignar equipo */}
      <UIDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <UIDialogContent className="sm:max-w-[400px]">
          <UIDialogHeader>
            <UIDialogTitle>Asignar equipo al proyecto</UIDialogTitle>
            <UIDialogDescription>Selecciona el equipo responsable de este proyecto.</UIDialogDescription>
          </UIDialogHeader>
          <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona equipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin equipo</SelectItem>
              {teams.map(t => (
                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              updateProject.mutate({ teamId: selectedTeamId === "none" ? null : Number(selectedTeamId) }, {
                onSuccess: () => {
                  toast({ title: "Proyecto actualizado"});
                  setAssignDialogOpen(false);
                }
              });
            }}>
              Guardar
            </Button>
          </div>
        </UIDialogContent>
      </UIDialog>

      {/* Dialog nueva tarea */}
      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        projectId={project.id}
        possibleAssignees={teamMembers.filter((m: TeamMember) => m.teamId === project.teamId)}
      />
    </>
  );
}

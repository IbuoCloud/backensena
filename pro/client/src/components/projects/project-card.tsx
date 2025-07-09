import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { ExternalLink, Calendar, MoreVertical, Trash } from "lucide-react";
import { Link } from "wouter";
import { formatDate } from "@/lib/utils";
import { useTeamMembers } from "@/hooks/use-team";
import type { Project } from "@shared/schema";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useDeleteProject } from "@/hooks/use-projects";
import { useState } from "react";
import EditProjectDialog from "@/components/projects/edit-project-dialog";
import { useQueryClient } from "@tanstack/react-query";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { getTeamMembersByIds } = useTeamMembers();
  const deleteProject = useDeleteProject(project.id);
  const [editOpen, setEditOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Obtener el proyecto actualizado de la caché (si existe)
  const cachedProjects = queryClient.getQueryData<any[]>(["/api/projects"]);
  const currentProject = cachedProjects?.find((p) => p.id === project.id) || project;

  // Function to determine project status based on progress and dates
  const getProjectStatus = (project: Project): string => {
    const today = new Date();
    
    if (project.status === "completed") return "completed";
    
    if (project.endDate && new Date(project.endDate) < today && project.progress < 100) {
      return "late";
    }
    
    if (project.progress > 80) return "review";
    
    return "active";
  };

  // Function to get team members for a project (mocked for demo)
  const getProjectMembers = (projectId: number) => {
    // In a real app, this would come from the API with actual assignment info
    const memberMap: Record<number, number[]> = {
      1: [1, 2, 3],
      2: [4, 5],
      3: [1, 3],
    };
    
    return getTeamMembersByIds(memberMap[projectId] || []);
  };

  const status = getProjectStatus(project);
  const statusMap: Record<string, { className: string; label: string }> = {
    active: { className: "bg-green-100 text-green-800", label: "En progreso" },
    review: { className: "bg-amber-100 text-amber-800", label: "En revisión" },
    completed: { className: "bg-blue-100 text-blue-800", label: "Completado" },
    late: { className: "bg-red-100 text-red-800", label: "Atrasado" },
  };

  const { className, label } = statusMap[status] || statusMap.active;

  return (
    <>
      <Card className="shadow-sm hover:shadow transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge className={className}>
              {label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={() => deleteProject.mutate()}>
                  <Trash className="h-4 w-4 mr-2" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="text-lg mt-2">{project.name}</CardTitle>
          <div className="text-sm text-slate-500">{project.clientName}</div>
        </CardHeader>
        <CardContent className="pb-3">
          {project.description && (
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{project.description}</p>
          )}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Progreso</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
          
          <div className="flex justify-between items-center text-sm text-slate-500 mb-2">
            <div className="flex items-center">
              <Calendar className="mr-1.5 h-4 w-4" />
              <span>Fecha límite:</span>
            </div>
            <span className="font-medium">
              {project.endDate ? formatDate(new Date(project.endDate)) : "No definida"}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2 border-t border-slate-100">
          <AvatarGroup items={getProjectMembers(project.id)} />
          <Link href={`/projects/${project.id}`}>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver detalles
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
      <EditProjectDialog open={editOpen} onOpenChange={setEditOpen} project={currentProject} />
    </>
  );
}

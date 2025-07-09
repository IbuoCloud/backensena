import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Filter, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTeamMembers } from "@/hooks/use-team";
import { formatDate } from "@/lib/utils";
import type { Project } from "@shared/schema";

interface ProjectStatusBadgeProps {
  status: string;
}

function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const statusMap: Record<string, { className: string; label: string }> = {
    active: { className: "bg-green-100 text-green-800", label: "En progreso" },
    review: { className: "bg-amber-100 text-amber-800", label: "En revisión" },
    completed: { className: "bg-blue-100 text-blue-800", label: "Completado" },
    late: { className: "bg-red-100 text-red-800", label: "Atrasado" },
  };

  const { className, label } = statusMap[status] || statusMap.active;

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

function ProjectIcon({ type }: { type: string }) {
  const icons: Record<string, { className: string; icon: string }> = {
    web: { className: "bg-violet-100 text-violet-600", icon: "ri-code-box-line" },
    mobile: { className: "bg-blue-100 text-blue-600", icon: "ri-smartphone-line" },
    ecommerce: { className: "bg-emerald-100 text-emerald-600", icon: "ri-store-2-line" },
    default: { className: "bg-slate-100 text-slate-600", icon: "ri-folder-line" },
  };

  const { className, icon } = icons[type] || icons.default;

  return (
    <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${className} flex items-center justify-center text-lg`}>
      <i className={icon}></i>
    </div>
  );
}

export default function ProjectTable() {
  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { getTeamMembersByIds } = useTeamMembers();

  if (!projects) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proyectos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <p>Cargando proyectos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Function to get project type based on the name (just for demo)
  const getProjectType = (name: string): string => {
    if (name.toLowerCase().includes("web") || name.toLowerCase().includes("plataforma")) return "web";
    if (name.toLowerCase().includes("móvil") || name.toLowerCase().includes("app")) return "mobile";
    if (name.toLowerCase().includes("ecommerce") || name.toLowerCase().includes("tienda")) return "ecommerce";
    return "default";
  };

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
    // In a real app, this would come from the API
    const memberMap: Record<number, number[]> = {
      1: [1, 2, 3],
      2: [4, 5],
      3: [1, 3],
    };
    
    return getTeamMembersByIds(memberMap[projectId] || []);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Proyectos Recientes</CardTitle>
          <div className="flex">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary mr-3">
              <Filter className="h-5 w-5" />
            </Button>
            <Link href="/projects">
              <Button variant="link" className="text-sm text-primary font-medium hover:text-primary-600 flex items-center">
                Ver todos <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="whitespace-nowrap">Proyecto</TableHead>
              <TableHead className="whitespace-nowrap">Progreso</TableHead>
              <TableHead className="whitespace-nowrap">Miembros</TableHead>
              <TableHead className="whitespace-nowrap">Fecha Límite</TableHead>
              <TableHead className="whitespace-nowrap">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.slice(0, 3).map((project: Project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div className="flex items-center">
                    <ProjectIcon type={getProjectType(project.name)} />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">{project.name}</div>
                      <div className="text-xs text-slate-500">{project.clientName}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="w-full">
                    <Progress value={project.progress} className="h-2" />
                    <div className="text-xs text-slate-500 mt-1">{project.progress}% completado</div>
                  </div>
                </TableCell>
                <TableCell>
                  <AvatarGroup items={getProjectMembers(project.id)} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-slate-500">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4 text-slate-400" />
                    {project.endDate ? formatDate(new Date(project.endDate)) : "No definida"}
                  </div>
                </TableCell>
                <TableCell>
                  <ProjectStatusBadge status={getProjectStatus(project)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

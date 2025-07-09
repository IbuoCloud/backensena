import { useState } from "react";
import DashboardHeader from "@/components/layout/dashboard-header";
import ProjectCard from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/hooks/use-projects";
import { Grid, List, Plus, Filter, Search } from "lucide-react";
import { useProjectContext } from "@/context/project-context";

export default function Projects() {
  const { projects, isLoading } = useProjects();
  const { createNewProject } = useProjectContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.clientName && project.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <DashboardHeader title="Proyectos" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6 pb-20 md:pb-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative w-full md:w-64">
              <Input
                placeholder="Buscar proyectos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            
            <Button size="sm" className="flex items-center">
              <Filter className="mr-1.5 h-4 w-4" /> Filtros
            </Button>
          </div>
          
          <div className="flex gap-2">
            <div className="flex border rounded-md overflow-hidden">
              <Button
                size="sm"
                variant={viewMode === "grid" ? "default" : "ghost"}
                onClick={() => setViewMode("grid")}
                className="rounded-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "ghost"}
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <Button onClick={createNewProject} className="flex items-center">
              <Plus className="mr-1.5 h-4 w-4" /> Nuevo Proyecto
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p>Cargando proyectos...</p>
          </div>
        ) : (
          <>
            {filteredProjects.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron proyectos</h3>
                <p className="text-slate-500 mb-4">Intenta con otra búsqueda o crea un nuevo proyecto</p>
                <Button onClick={createNewProject}>
                  <Plus className="mr-1.5 h-4 w-4" /> Crear Proyecto
                </Button>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

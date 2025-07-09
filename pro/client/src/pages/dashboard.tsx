import { Grid } from "lucide-react";
import DashboardHeader from "@/components/layout/dashboard-header";
import StatCard from "@/components/dashboard/stat-card";
import ProjectTable from "@/components/dashboard/project-table";
import CalendarWidget from "@/components/dashboard/calendar-widget";
import KanbanBoard from "@/components/tasks/kanban-board";
import GanttChart from "@/components/projects/gantt-chart";
import { useProjectStats } from "@/hooks/use-project-stats";
import { Folder, CheckSquare, CheckCheck, Clock } from "lucide-react";

export default function Dashboard() {
  const { stats, isLoading } = useProjectStats();
  
  return (
    <>
      <DashboardHeader title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6 pb-20 md:pb-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Folder />}
            title="Proyectos Activos"
            value={isLoading ? "--" : stats.activeProjects}
            change={{
              value: "14%",
              type: "increase",
              label: "desde el mes pasado"
            }}
            iconBgClassName="bg-blue-100"
            iconClassName="text-primary"
          />
          
          <StatCard
            icon={<CheckSquare />}
            title="Tareas Pendientes"
            value={isLoading ? "--" : stats.pendingTasks}
            change={{
              value: "5",
              type: "decrease",
              label: "tareas vencidas"
            }}
            iconBgClassName="bg-violet-100"
            iconClassName="text-accent"
          />
          
          <StatCard
            icon={<CheckCheck />}
            title="Tareas Completadas"
            value={isLoading ? "--" : stats.completedTasks}
            change={{
              value: "12",
              type: "increase",
              label: "esta semana"
            }}
            iconBgClassName="bg-emerald-100"
            iconClassName="text-emerald-500"
          />
          
          <StatCard
            icon={<Clock />}
            title="Horas Registradas"
            value={isLoading ? "--" : ((stats.timeSpent || 0) / 60).toFixed(1)}
            change={{
              value: `${stats.productivity || 0}%`,
              type: "increase",
              label: "de productividad"
            }}
            iconBgClassName="bg-amber-100"
            iconClassName="text-amber-500"
          />
        </div>

        {/* Projects Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Recent Projects Table */}
          <div className="lg:col-span-2">
            <ProjectTable />
          </div>

          {/* Calendar Widget */}
          <div>
            <CalendarWidget />
          </div>
        </div>

        {/* Kanban Board Preview */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Tareas del Proyecto "Rediseño de Plataforma Web"</h3>
                  <p className="text-sm text-slate-500">Vista Kanban simplificada</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center">
                    <Grid className="mr-1.5 h-4 w-4" /> Vista Gantt
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center">
                    <CheckSquare className="mr-1.5 h-4 w-4" /> Vista Lista
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-primary-50 border border-primary-300 rounded-lg text-primary-700 hover:bg-primary-100 flex items-center">
                    <Grid className="mr-1.5 h-4 w-4" /> Vista Kanban
                  </button>
                </div>
              </div>
            </div>
            <KanbanBoard projectId={1} />
          </div>
        </div>

        {/* Gantt Chart Preview */}
        <GanttChart projectId={1} />
      </main>
    </>
  );
}

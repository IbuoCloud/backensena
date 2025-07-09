import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useTasksForProject } from "@/hooks/use-tasks";
import { useMilestones } from "@/hooks/use-project-stats";
import { cn, formatDate } from "@/lib/utils";
import { format, differenceInDays, addDays } from "date-fns";
import { es } from "date-fns/locale";

interface GanttChartProps {
  projectId: number;
}

export default function GanttChart({ projectId }: GanttChartProps) {
  const { tasks } = useTasksForProject(projectId);
  const { milestones } = useMilestones(projectId);

  const project = {
    startDate: new Date("2023-10-01"),
    endDate: new Date("2023-11-30"),
  };

  // Group tasks by type for the Gantt chart
  const ganttGroups = [
    {
      name: "Configuración del Proyecto",
      tasks: tasks.filter(t => t.title.toLowerCase().includes("configuración") || t.title.toLowerCase().includes("definición")),
      color: "bg-green-500",
    },
    {
      name: "Diseño de UI/UX",
      tasks: tasks.filter(t => 
        t.title.toLowerCase().includes("diseño") || 
        t.title.toLowerCase().includes("mockup") || 
        t.title.toLowerCase().includes("ux")
      ),
      color: "bg-purple-500",
    },
    {
      name: "Desarrollo Frontend",
      tasks: tasks.filter(t => 
        t.title.toLowerCase().includes("frontend") || 
        t.title.toLowerCase().includes("responsive") ||
        t.title.toLowerCase().includes("componentes")
      ),
      color: "bg-blue-500",
    },
    {
      name: "Desarrollo Backend",
      tasks: tasks.filter(t => 
        t.title.toLowerCase().includes("backend") || 
        t.title.toLowerCase().includes("api") ||
        t.title.toLowerCase().includes("base de datos")
      ),
      color: "bg-indigo-500",
    },
    {
      name: "Pruebas y QA",
      tasks: tasks.filter(t => 
        t.title.toLowerCase().includes("prueba") || 
        t.title.toLowerCase().includes("test") ||
        t.title.toLowerCase().includes("usabilidad")
      ),
      color: "bg-amber-500",
    },
    {
      name: "Despliegue",
      tasks: tasks.filter(t => 
        t.title.toLowerCase().includes("despliegue") || 
        t.title.toLowerCase().includes("deploy") ||
        t.title.toLowerCase().includes("lanzamiento")
      ),
      color: "bg-red-500",
    },
  ];

  // Calculate the total duration in weeks
  const totalDays = differenceInDays(project.endDate, project.startDate);
  const totalWeeks = Math.ceil(totalDays / 7);

  // Generate week labels
  const weekLabels = Array.from({ length: totalWeeks }, (_, i) => {
    const startDate = addDays(project.startDate, i * 7);
    const endDate = addDays(startDate, 6);
    return `${format(startDate, "d", { locale: es })}-${format(endDate, "d MMM", { locale: es })}`;
  });

  // Function to calculate position and width of a task bar
  const calculateTaskPosition = (task: any) => {
    const startDate = task.dueDate 
      ? new Date(new Date(task.dueDate).setDate(new Date(task.dueDate).getDate() - 7)) // Approximate start date as 1 week before due date
      : project.startDate;
    const endDate = task.dueDate ? new Date(task.dueDate) : project.endDate;
    
    const daysFromStart = differenceInDays(startDate, project.startDate);
    const taskDuration = differenceInDays(endDate, startDate);
    
    // Calculate position as percentage of total duration
    const position = (daysFromStart / totalDays) * 100;
    const width = (taskDuration / totalDays) * 100;
    
    return {
      position: `${position}%`,
      width: `${width}%`,
    };
  };

  // Export chart as image
  const handleExport = () => {
    // This would be implemented to create a downloadable image or PDF
    // For now, we just show a toast message
    alert("Exportación de gráfico no implementada en este prototipo");
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">Cronograma del Proyecto</CardTitle>
            <CardDescription>Vista Gantt simplificada</CardDescription>
          </div>
          <Button onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" /> Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 overflow-x-auto scrollbar-hide">
        <div className="min-w-max">
          <div className="flex mb-4">
            <div className="w-64 flex-shrink-0"></div>
            <div className="flex">
              {weekLabels.map((label, i) => (
                <div key={i} className="text-xs font-medium text-slate-500 w-20 text-center">{label}</div>
              ))}
            </div>
          </div>
          
          {ganttGroups.map((group, i) => (
            <div key={i} className="flex items-center mb-2 h-10">
              <div className="w-64 flex-shrink-0 text-sm font-medium text-slate-900 pr-4">
                {group.name}
              </div>
              <div className="flex h-6 items-center relative flex-1">
                {group.tasks.length > 0 ? (
                  group.tasks.map((task) => {
                    const { position, width } = calculateTaskPosition(task);
                    return (
                      <div 
                        key={task.id}
                        className={cn(
                          "absolute h-full px-0.5",
                          task.completed ? "opacity-70" : "opacity-90"
                        )}
                        style={{ left: position, width }}
                      >
                        <div className={cn("h-full rounded-md", group.color)}></div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex-1 text-xs text-slate-400 pl-2">No hay tareas asignadas</div>
                )}
              </div>
            </div>
          ))}
          
          {/* Milestones */}
          <div className="mt-6 mb-2">
            <h4 className="text-sm font-medium text-slate-900 mb-3">Hitos del Proyecto</h4>
            {milestones.map((milestone) => {
              const daysFromStart = differenceInDays(new Date(milestone.date), project.startDate);
              const position = (daysFromStart / totalDays) * 100;
              
              return (
                <div key={milestone.id} className="flex items-center mb-2">
                  <div className="w-64 flex-shrink-0 text-sm text-slate-700 pr-4">
                    {milestone.title}
                  </div>
                  <div className="relative h-5 flex-1">
                    <div
                      className="absolute top-0 w-5 h-5 rounded-full bg-primary transform -translate-y-1/2"
                      style={{ left: `${position}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-500 ml-2">
                    {formatDate(new Date(milestone.date))}
                  </div>
                </div>
              );
            })}
            
            {milestones.length === 0 && (
              <div className="text-center py-2 text-sm text-slate-500">
                No hay hitos definidos
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

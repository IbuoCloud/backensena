import { useState } from "react";
import DashboardHeader from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useProjects } from "@/hooks/use-projects";
import { useProjectStats } from "@/hooks/use-project-stats";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { BarChart2, Download, FileText, PieChart as PieChartIcon } from "lucide-react";

export default function Reports() {
  const [reportPeriod, setReportPeriod] = useState("month");
  const [reportType, setReportType] = useState("progress");
  const { projects } = useProjects();
  const { stats } = useProjectStats();

  // Mock data for charts
  const projectProgressData = projects.map(project => ({
    name: project.name.length > 20 ? project.name.substring(0, 20) + "..." : project.name,
    progress: project.progress
  }));

  const taskStatusData = [
    { name: "Por hacer", value: stats.pendingTasks },
    { name: "En progreso", value: 8 }, // Mock data
    { name: "En revisión", value: 5 }, // Mock data
    { name: "Completadas", value: stats.completedTasks }
  ];

  const timeSpentData = [
    { name: "Semana 1", diseño: 12, desarrollo: 8, testing: 3 },
    { name: "Semana 2", diseño: 8, desarrollo: 15, testing: 5 },
    { name: "Semana 3", diseño: 5, desarrollo: 20, testing: 8 },
    { name: "Semana 4", diseño: 3, desarrollo: 18, testing: 12 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleExportReport = () => {
    // This would be implemented to generate a PDF or Excel report
    alert("Exportación de reportes no implementada en este prototipo");
  };

  return (
    <>
      <DashboardHeader title="Informes" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6 pb-20 md:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="col-span-1 md:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Reporte de Proyectos</CardTitle>
                  <CardDescription>
                    Análisis del progreso y rendimiento
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleExportReport}>
                    <Download className="mr-2 h-4 w-4" /> Exportar
                  </Button>
                  <Button variant="outline" onClick={handleExportReport}>
                    <FileText className="mr-2 h-4 w-4" /> PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between md:items-center">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-48">
                      <label className="text-sm font-medium mb-1 block">Período</label>
                      <Select
                        value={reportPeriod}
                        onValueChange={setReportPeriod}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">Esta semana</SelectItem>
                          <SelectItem value="month">Este mes</SelectItem>
                          <SelectItem value="quarter">Este trimestre</SelectItem>
                          <SelectItem value="year">Este año</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full md:w-48">
                      <label className="text-sm font-medium mb-1 block">Tipo de reporte</label>
                      <Select
                        value={reportType}
                        onValueChange={setReportType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="progress">Progreso de proyectos</SelectItem>
                          <SelectItem value="tasks">Estado de tareas</SelectItem>
                          <SelectItem value="time">Tiempo invertido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="charts" className="w-full">
                  <TabsList className="grid grid-cols-3 w-[300px] mb-6">
                    <TabsTrigger value="charts">
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Gráficos
                    </TabsTrigger>
                    <TabsTrigger value="summary">
                      <PieChartIcon className="h-4 w-4 mr-2" />
                      Resumen
                    </TabsTrigger>
                    <TabsTrigger value="details">
                      <FileText className="h-4 w-4 mr-2" />
                      Detalles
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="charts">
                    <div className="h-96">
                      {reportType === "progress" && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={projectProgressData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              angle={-45} 
                              textAnchor="end"
                              tick={{ fontSize: 12 }}
                              height={80}
                            />
                            <YAxis label={{ value: 'Progreso (%)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="progress" fill="#3b82f6" name="Progreso (%)" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                      
                      {reportType === "tasks" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={taskStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {taskStatusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                          
                          <div className="flex flex-col justify-center">
                            <div className="mb-4">
                              <h3 className="text-lg font-medium mb-2">Distribución de Tareas</h3>
                              <p className="text-slate-500">
                                Desglose de tareas según su estado actual en todos los proyectos.
                              </p>
                            </div>
                            <div className="space-y-2">
                              {taskStatusData.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                  <div className="flex items-center">
                                    <div 
                                      className="w-3 h-3 rounded-full mr-2"
                                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    ></div>
                                    <span>{item.name}</span>
                                  </div>
                                  <span className="font-medium">{item.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {reportType === "time" && (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={timeSpentData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="diseño" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="desarrollo" stroke="#82ca9d" />
                            <Line type="monotone" dataKey="testing" stroke="#ffc658" />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="summary">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Resumen de Proyectos</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <dl className="space-y-2">
                            <div className="flex justify-between py-1 border-b">
                              <dt className="text-slate-500">Proyectos Totales</dt>
                              <dd className="font-medium">{projects.length}</dd>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                              <dt className="text-slate-500">Proyectos Activos</dt>
                              <dd className="font-medium">{stats.activeProjects}</dd>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                              <dt className="text-slate-500">Proyectos Completados</dt>
                              <dd className="font-medium">{stats.completedProjects}</dd>
                            </div>
                            <div className="flex justify-between py-1">
                              <dt className="text-slate-500">Progreso Promedio</dt>
                              <dd className="font-medium">
                                {Math.round(
                                  projects.reduce((acc, project) => acc + project.progress, 0) / 
                                  (projects.length || 1)
                                )}%
                              </dd>
                            </div>
                          </dl>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Resumen de Tareas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <dl className="space-y-2">
                            <div className="flex justify-between py-1 border-b">
                              <dt className="text-slate-500">Tareas Totales</dt>
                              <dd className="font-medium">{stats.pendingTasks + stats.completedTasks}</dd>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                              <dt className="text-slate-500">Tareas Pendientes</dt>
                              <dd className="font-medium">{stats.pendingTasks}</dd>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                              <dt className="text-slate-500">Tareas Completadas</dt>
                              <dd className="font-medium">{stats.completedTasks}</dd>
                            </div>
                            <div className="flex justify-between py-1">
                              <dt className="text-slate-500">Tasa de Completitud</dt>
                              <dd className="font-medium">{stats.productivity}%</dd>
                            </div>
                          </dl>
                        </CardContent>
                      </Card>
                      
                      <Card className="md:col-span-2">
                        <CardHeader>
                          <CardTitle className="text-base">Tiempo y Productividad</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <dl className="space-y-2">
                            <div className="flex justify-between py-1 border-b">
                              <dt className="text-slate-500">Horas Totales Registradas</dt>
                              <dd className="font-medium">{(stats.timeSpent / 60).toFixed(1)}</dd>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                              <dt className="text-slate-500">Promedio Horas por Tarea</dt>
                              <dd className="font-medium">
                                {((stats.timeSpent / 60) / (stats.completedTasks || 1)).toFixed(1)}
                              </dd>
                            </div>
                            <div className="flex justify-between py-1">
                              <dt className="text-slate-500">Productividad</dt>
                              <dd className="font-medium">{stats.productivity}%</dd>
                            </div>
                          </dl>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details">
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center py-8">
                          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">Reporte Detallado</h3>
                          <p className="text-slate-500 mb-6 max-w-md mx-auto">
                            Los reportes detallados te permiten ver información en profundidad sobre proyectos, 
                            tareas y recursos. Selecciona los criterios deseados y genera un informe.
                          </p>
                          <Button onClick={handleExportReport}>
                            <Download className="mr-2 h-4 w-4" /> Generar Informe Detallado
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informes Guardados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Progreso Mensual
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Distribución de Tareas
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Desempeño del Equipo
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Exportar Datos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={handleExportReport}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar como PDF
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleExportReport}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar como Excel
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleExportReport}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar como CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

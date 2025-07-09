import { useState } from "react";
import DashboardHeader from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeamMembers } from "@/hooks/use-team";
import { useTeams } from "@/hooks/use-teams";
import { Plus, Search, Mail, Phone, PieChart, Briefcase, Clock } from "lucide-react";
import CreateTeamDialog from "@/components/teams/create-team-dialog";
import ManageTeamDialog from "@/components/teams/manage-team-dialog";
import CreateMemberDialog from "@/components/teams/create-member-dialog";
import type { Team } from "@shared/schema";

export default function Team() {
  const { teamMembers, isLoading } = useTeamMembers();
  const { teams } = useTeams();
  const [searchQuery, setSearchQuery] = useState("");
  const [newMemberDialogOpen, setNewMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [memberDetailsDialogOpen, setMemberDetailsDialogOpen] = useState(false);
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);
  const [manageTeamDialogOpen, setManageTeamDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Filter team members based on search query
  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMemberClick = (memberId: number) => {
    setSelectedMember(memberId);
    setMemberDetailsDialogOpen(true);
  };

  // Mocked data for a member profile (would be fetched from the API)
  const getMemberDetails = (memberId: number) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return null;

    return {
      ...member,
      phone: "", // Mock data
      skills: ["React", "TypeScript", "UI/UX", "Node.js", "Express"], // Mock data
      projects: [
        { id: 1, name: "Rediseño de Plataforma Web" },
        { id: 3, name: "Plataforma E-commerce" }
      ], // Mock data
      tasksCompleted: 24, // Mock data
      tasksInProgress: 5, // Mock data
      hoursLogged: 87.5, // Mock data
    };
  };

  return (
    <>
      <DashboardHeader title="Equipo" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6 pb-20 md:pb-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <Input
              placeholder="Buscar miembros..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCreateTeamDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Crear Equipo
            </Button>
            <Button onClick={() => setNewMemberDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Añadir Miembro
            </Button>
          </div>
        </div>

        {/* Team Members Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p>Cargando miembros del equipo...</p>
          </div>
        ) : (
          <>
            {filteredMembers.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron miembros del equipo</h3>
                <p className="text-slate-500 mb-4">Intenta con otra búsqueda o añade un nuevo miembro</p>
                <Button onClick={() => setNewMemberDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Añadir Miembro
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMembers.map((member) => (
                  <Card key={member.id} className="cursor-pointer hover:shadow transition-shadow" onClick={() => handleMemberClick(member.id)}>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4">
                          <AvatarImage src={member.avatarUrl ?? undefined} alt={member.name} />
                          <AvatarFallback className="text-lg">
                            {member.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-lg font-medium text-slate-900">{member.name}</h3>
                        <p className="text-sm text-slate-500 mb-3">{member.role}</p>
                        <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                          {member.role.includes("Desarrollador") ? "Desarrollo" : 
                           member.role.includes("Diseñador") ? "Diseño" : 
                           member.role.includes("QA") ? "Testing" : "Gestión"}
                        </Badge>
                        <div className="mt-4 w-full">
                          <a href={`mailto:${member.email}`} className="text-sm text-slate-500 flex items-center justify-center gap-2 py-1 hover:text-primary" onClick={(e) => e.stopPropagation()}>
                            <Mail className="h-4 w-4" /> {member.email}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Lista de equipos */}
        {teams.length > 0 && (
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {teams.map((team) => (
              <Card key={team.id} className="group cursor-pointer" onClick={() => { setSelectedTeam(team); setManageTeamDialogOpen(true); }}>
                <CardContent className="p-4 flex flex-col items-center">
                  <Avatar className="h-12 w-12 mb-2">
                    <AvatarImage src={team.avatarUrl ?? undefined} alt={team.name} />
                    <AvatarFallback>{team.name.slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-sm text-center group-hover:text-primary truncate w-full" title={team.name}>{team.name}</p>
                  {team.description && <p className="text-xs text-slate-500 text-center truncate w-full" title={team.description}>{team.description}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Dialogos */}
      <CreateTeamDialog open={createTeamDialogOpen} onOpenChange={setCreateTeamDialogOpen} />
      <ManageTeamDialog team={selectedTeam} open={manageTeamDialogOpen} onOpenChange={setManageTeamDialogOpen} />
      <CreateMemberDialog open={newMemberDialogOpen} onOpenChange={setNewMemberDialogOpen} />

      {/* Member Details Dialog */}
      <Dialog open={memberDetailsDialogOpen} onOpenChange={setMemberDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle>Detalles del miembro</DialogTitle>
              </DialogHeader>
              
              {(() => {
                const memberDetails = getMemberDetails(selectedMember);
                if (!memberDetails) return <p>No se encontró la información</p>;
                
                return (
                  <div className="py-4">
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={memberDetails.avatarUrl ?? undefined} alt={memberDetails.name} />
                        <AvatarFallback className="text-lg">
                          {memberDetails.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-xl font-bold">{memberDetails.name}</h2>
                        <p className="text-slate-500 mb-2">{memberDetails.role}</p>
                        
                        <div className="flex flex-col sm:flex-row gap-3 text-sm">
                          <a href={`mailto:${memberDetails.email}`} className="text-slate-600 flex items-center gap-1">
                            <Mail className="h-4 w-4" /> {memberDetails.email}
                          </a>
                          <a href={`tel:${memberDetails.phone}`} className="text-slate-600 flex items-center gap-1">
                            <Phone className="h-4 w-4" /> {memberDetails.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="overview">Resumen</TabsTrigger>
                        <TabsTrigger value="projects">Proyectos</TabsTrigger>
                        <TabsTrigger value="tasks">Tareas</TabsTrigger>
                      </TabsList>
                      <TabsContent value="overview">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <Card>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                              <PieChart className="h-8 w-8 text-primary mb-1" />
                              <p className="text-2xl font-bold">{memberDetails.projects.length}</p>
                              <p className="text-sm text-slate-500">Proyectos Activos</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                              <CheckCircle className="h-8 w-8 text-green-500 mb-1" />
                              <p className="text-2xl font-bold">{memberDetails.tasksCompleted}</p>
                              <p className="text-sm text-slate-500">Tareas Completadas</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                              <Clock className="h-8 w-8 text-amber-500 mb-1" />
                              <p className="text-2xl font-bold">{memberDetails.hoursLogged}</p>
                              <p className="text-sm text-slate-500">Horas Registradas</p>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <h3 className="text-sm font-medium mb-2">Habilidades</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {memberDetails.skills.map((skill, i) => (
                            <Badge key={i} variant="outline" className="bg-slate-100">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="projects">
                        <div className="space-y-3">
                          {memberDetails.projects.map((project) => (
                            <Card key={project.id}>
                              <CardContent className="p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="bg-blue-100 rounded-lg p-2 text-blue-600">
                                    <Briefcase className="h-5 w-5" />
                                  </div>
                                  <span>{project.name}</span>
                                </div>
                                <Button variant="ghost" size="sm">Ver</Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="tasks">
                        <div className="text-center py-8">
                          <p className="text-slate-500">Vista de tareas en desarrollo</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                );
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

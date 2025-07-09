import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Users, 
  BarChartHorizontal,
  Plus,
  LogOut,
  X
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProjectContext } from "@/context/project-context";

export default function Sidebar() {
  const [location] = useLocation();
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const { createNewProject } = useProjectContext();

  const navLinks = [
    { href: "/", icon: <LayoutDashboard className="mr-3 text-lg" />, label: "Dashboard" },
    { href: "/projects", icon: <CheckSquare className="mr-3 text-lg" />, label: "Mis Proyectos" },
    { href: "/calendar", icon: <Calendar className="mr-3 text-lg" />, label: "Calendario" },
    { href: "/team", icon: <Users className="mr-3 text-lg" />, label: "Equipo" },
    { href: "/reports", icon: <BarChartHorizontal className="mr-3 text-lg" />, label: "Informes" },
  ];

  const handleCreateProject = () => {
    createNewProject();
    setNewProjectDialogOpen(false);
  };

  return (
    <>
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white shadow-sm border-r border-slate-200">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 px-4 border-b border-slate-200">
            <h1 className="text-xl font-bold text-primary flex items-center">
              <CheckSquare className="mr-2 h-6 w-6" />
              MBV MANAGER
            </h1>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            <div className="px-4 mb-4">
              <Button 
                className="w-full" 
                onClick={() => setNewProjectDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
              </Button>
            </div>
            <div className="space-y-1 px-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    location === link.href
                      ? "text-slate-900 bg-slate-100"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {React.cloneElement(link.icon, {
                    className: cn(
                      "text-lg mr-3",
                      location === link.href ? "text-primary" : "text-slate-500"
                    )
                  })}
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
          <div className="px-4 py-4 border-t border-slate-200">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200" 
                  alt="Avatar de usuario" 
                />
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-900">Ana Martínez</p>
                <p className="text-xs text-slate-500">Gerente de Proyectos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear nuevo proyecto</DialogTitle>
            <DialogDescription>
              Complete la información básica para crear un nuevo proyecto
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex justify-end">
              <Button onClick={handleCreateProject}>Crear proyecto</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

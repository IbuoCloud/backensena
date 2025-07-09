import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, CheckSquare, Calendar, Users, PlusCircle } from "lucide-react";
import { useProjectContext } from "@/context/project-context";

export default function MobileNav() {
  const [location] = useLocation();
  const { createNewProject } = useProjectContext();

  const navLinks = [
    { href: "/", icon: <LayoutDashboard className="text-xl" />, label: "Dashboard" },
    { href: "/projects", icon: <CheckSquare className="text-xl" />, label: "Proyectos" },
    { href: "/calendar", icon: <Calendar className="text-xl" />, label: "Calendario" },
    { href: "/team", icon: <Users className="text-xl" />, label: "Equipo" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-10 bg-white border-t border-slate-200">
      <div className="flex justify-around">
        {navLinks.map((link, index) => (
          <Link 
            key={link.href} 
            href={link.href}
            className={cn(
              "flex flex-col items-center pt-2 pb-1",
              location === link.href ? "text-primary" : "text-slate-400"
            )}
          >
            {React.cloneElement(link.icon, {
              className: cn("text-xl", location === link.href ? "text-primary" : "text-slate-400")
            })}
            <span className="text-xs mt-1">{link.label}</span>
          </Link>
        ))}
        
        <button 
          onClick={createNewProject}
          className="flex flex-col items-center pt-2 pb-1 text-slate-400"
        >
          <PlusCircle className="-mt-5 text-2xl text-primary bg-white rounded-full" />
          <span className="text-xs mt-1">Nuevo</span>
        </button>
      </div>
    </div>
  );
}

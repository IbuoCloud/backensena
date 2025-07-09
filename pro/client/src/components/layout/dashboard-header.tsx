import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, ChevronDown } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
}

export default function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    <header className="hidden md:flex bg-white shadow-sm px-6 py-4 border-b border-slate-200">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar..."
              className="py-2 pl-10 pr-4 w-64"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
          <Button variant="outline" size="icon" className="text-slate-500">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"
                alt="Avatar de usuario"
              />
              <AvatarFallback>AM</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">Ana Martínez</span>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </div>
        </div>
      </div>
    </header>
  );
}

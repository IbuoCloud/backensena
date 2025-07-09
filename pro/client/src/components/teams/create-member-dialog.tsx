import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTeams } from "@/hooks/use-teams";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateMemberDialog({ open, onOpenChange }: Props) {
  const { teams } = useTeams();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    role: "Desarrollador",
    email: "",
    avatarUrl: "",
    teamId: "none",
  });

  const handleInput = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  const handleSave = async () => {
    if (!form.name.trim() || !form.role.trim() || !form.email.trim()) return;
    try {
      await apiRequest("POST", "/api/team", {
        name: form.name,
        role: form.role,
        email: form.email,
        avatarUrl: form.avatarUrl || null,
        teamId: form.teamId === "none" ? null : Number(form.teamId),
      });
      await qc.invalidateQueries({ queryKey: ["/api/team"] });
      toast({ title: "Miembro creado" });
      onOpenChange(false);
      setForm({ name: "", role: "Desarrollador", email: "", avatarUrl: "", teamId: "none" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir nuevo miembro</DialogTitle>
          <DialogDescription>Completa los datos del miembro.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <Input placeholder="Nombre" value={form.name} onChange={handleInput("name")} />
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Desarrollador",
                "Diseñador",
                "QA",
                "Gestión",
              ].map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Email" value={form.email} onChange={handleInput("email")} />
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {form.avatarUrl ? (
                <AvatarImage src={form.avatarUrl} alt={form.name} />
              ) : (
                <AvatarFallback>{form.name.slice(0,2).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            <Input placeholder="Avatar URL (opcional)" value={form.avatarUrl} onChange={handleInput("avatarUrl")} />
          </div>
          <Select value={form.teamId} onValueChange={(v) => setForm({ ...form, teamId: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Asignar a equipo (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin equipo</SelectItem>
              {teams.map(t => (
                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-between items-center pt-4">
            <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
              {form.role}
            </Badge>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Crear</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
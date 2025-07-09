import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTeamMembers } from "@/hooks/use-team";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import type { Team } from "@shared/schema";

interface ManageTeamDialogProps {
  team: Team | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManageTeamDialog({ team, open, onOpenChange }: ManageTeamDialogProps) {
  const { teamMembers } = useTeamMembers();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const initialSelected = new Set(teamMembers.filter(m => m.teamId === team?.id).map(m => m.id));
  const [selected, setSelected] = useState<Set<number>>(initialSelected);

  const toggleMember = (id: number) => {
    const newSet = new Set(selected);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelected(newSet);
  };

  const handleSave = async () => {
    if (!team) return;
    try {
      const promises = teamMembers.map(m => {
        const shouldBelong = selected.has(m.id);
        if ((m.teamId === team.id) === shouldBelong) return Promise.resolve(); // no change
        return apiRequest("PUT", `/api/team/${m.id}`, { teamId: shouldBelong ? team.id : null });
      });
      await Promise.all(promises);
      await queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({ title: "Equipo actualizado" });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gestionar miembros del equipo {team?.name}</DialogTitle>
          <DialogDescription>Selecciona los miembros que pertenecerán a este equipo.</DialogDescription>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto flex flex-col gap-2 py-2">
          {teamMembers.map(member => (
            <label key={member.id} className="flex items-center gap-3">
              <Checkbox checked={selected.has(member.id)} onCheckedChange={() => toggleMember(member.id)} />
              <span>{member.name}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
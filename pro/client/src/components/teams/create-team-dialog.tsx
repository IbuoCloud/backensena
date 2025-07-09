import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTeamDialog({ open, onOpenChange }: CreateTeamDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    avatarUrl: "",
    avatarFile: null as File | null,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const MAX_DESCRIPTION = 150;

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    try {
      await apiRequest("POST", "/api/teams", { name: formData.name, description: formData.description, avatarUrl: formData.avatarUrl || null });
      await queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ title: "Equipo creado", description: `Se creó el equipo ${formData.name}` });
      setFormData({ name: "", description: "", avatarUrl: "", avatarFile: null });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear nuevo equipo</DialogTitle>
          <DialogDescription>Define un nombre y una descripción (opcional).</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-4">
            <label className="relative group cursor-pointer">
              <Avatar className="h-16 w-16">
                {formData.avatarUrl ? (
                  <AvatarImage src={formData.avatarUrl} alt={formData.name} />
                ) : (
                  <AvatarFallback className="text-base">
                    {formData.name.slice(0, 2).toUpperCase() || "EQ"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e)=>{
                const file=e.target.files?.[0];
                if(file){
                  const reader=new FileReader();
                  reader.onload=()=>{
                    setFormData({...formData, avatarUrl: reader.result as string, avatarFile: file});
                  };
                  reader.readAsDataURL(file);
                }
              }} />
            </label>
            <Input placeholder="Nombre del equipo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="flex-1" />
          </div>

          <div className="relative">
            <Textarea
              placeholder="Descripción (opcional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value.slice(0, MAX_DESCRIPTION) })
              }
              rows={3}
            />
            <span className="absolute bottom-1 right-2 text-xs text-slate-400 select-none">
              {formData.description.length}/{MAX_DESCRIPTION}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2">
            {formData.name && (
              <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                {formData.name}
              </Badge>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button disabled={!formData.name.trim()} onClick={handleCreate}>Crear</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProject } from "@/hooks/use-projects";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@shared/schema";

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

export default function EditProjectDialog({ open, onOpenChange, project }: EditProjectDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateProjectMutation = useUpdateProject(project.id);

  // Estado temporal solo para los cambios del formulario
  const [tempData, setTempData] = useState<Partial<Project>>({ ...project });

  // Sincronizar tempData cada vez que se abre el modal
  useEffect(() => {
    if (open) setTempData({ ...project });
  }, [open, project]);

  const handleChange = (field: keyof Project, value: any) => {
    setTempData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id: _omit, ...dataToUpdate } = tempData as Project & { id: number };
      await updateProjectMutation.mutateAsync(dataToUpdate);
      await queryClient.removeQueries({ queryKey: ["/api/projects"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      await queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}`] });
      onOpenChange(false);
      toast({ title: "Proyecto actualizado" });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el proyecto",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar proyecto</DialogTitle>
            <DialogDescription>
              Modifica los campos necesarios y guarda los cambios.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del proyecto</Label>
              <Input
                id="name"
                value={tempData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={tempData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="clientName">Cliente</Label>
              <Input
                id="clientName"
                value={tempData.clientName || ""}
                onChange={(e) => handleChange("clientName", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Fecha de inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !tempData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempData.startDate ? (
                        format(new Date(tempData.startDate), "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tempData.startDate ? new Date(tempData.startDate) : undefined}
                      onSelect={(date: Date | undefined) => handleChange("startDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>Fecha de finalización</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !tempData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempData.endDate ? (
                        format(new Date(tempData.endDate), "PPP", { locale: es })
                      ) : (
                        <span>Opcional</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tempData.endDate ? new Date(tempData.endDate) : undefined}
                      onSelect={(date: Date | undefined) => handleChange("endDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="default" disabled={updateProjectMutation.isPending}>
              {updateProjectMutation.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
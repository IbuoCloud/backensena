import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCreateProject } from "@/hooks/use-projects";
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
import type { InsertProject } from "@shared/schema";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const { toast } = useToast();
  const createProjectMutation = useCreateProject();
  
  const [formData, setFormData] = useState<Partial<InsertProject>>({
    name: "",
    description: "",
    clientName: "",
    startDate: new Date(),
    endDate: undefined,
    status: "active",
    progress: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createProjectMutation.mutateAsync(formData as InsertProject);
      onOpenChange(false);
      
      // Resetear el formulario
      setFormData({
        name: "",
        description: "",
        clientName: "",
        startDate: new Date(),
        endDate: undefined,
        status: "active",
        progress: 0
      });
      
      toast({
        title: "Proyecto creado",
        description: "El nuevo proyecto se ha creado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el nuevo proyecto",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear nuevo proyecto</DialogTitle>
            <DialogDescription>
              Ingresa los detalles básicos del proyecto. Podrás agregar más información después.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del proyecto</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Sistema de gestión de inventario"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe brevemente el proyecto..."
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="clientName">Cliente</Label>
              <Input
                id="clientName"
                value={formData.clientName || ""}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="Nombre del cliente o empresa"
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
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? (
                        format(formData.startDate, "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date: Date | undefined) => setFormData({ ...formData, startDate: date || new Date() })}
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
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? (
                        format(formData.endDate, "PPP", { locale: es })
                      ) : (
                        <span>Opcional</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date: Date | undefined) => setFormData({ ...formData, endDate: date })}
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
            <Button type="submit" variant="default" disabled={createProjectMutation.isPending}>
              {createProjectMutation.isPending ? "Creando..." : "Crear proyecto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
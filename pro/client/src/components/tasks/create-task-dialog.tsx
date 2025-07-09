import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useCreateTask } from "@/hooks/use-tasks";
import type { InsertTask, TeamMember } from "@shared/schema";
import React from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  possibleAssignees: TeamMember[];
}

export default function CreateTaskDialog({ open, onOpenChange, projectId, possibleAssignees }: Props) {
  const { toast } = useToast();
  const createTask = useCreateTask();

  const [form, setForm] = useState<Partial<InsertTask>>({
    title: "",
    description: "",
    priority: "medium",
    projectId,
    assigneeId: undefined,
    dueDate: undefined,
  });

  // reset when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setForm({ title: "", description: "", priority: "medium", projectId, assigneeId: undefined, dueDate: undefined });
    }
  }, [open, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) return;
    try {
      await createTask.mutateAsync({
        ...(form as InsertTask),
        dueDate: form.dueDate ? form.dueDate.toISOString() : undefined,
        column: "todo",
        order: 0,
      } as InsertTask);
      toast({ title: "Tarea creada" });
      onOpenChange(false);
    } catch {
      // el propio hook muestra toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear nueva tarea</DialogTitle>
            <DialogDescription>Define los detalles de la tarea. Podrás editarlos después.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Prioridad</Label>
                <Select value={form.priority || "medium"} onValueChange={(v) => setForm({ ...form, priority: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Asignar a</Label>
                <Select value={form.assigneeId ? String(form.assigneeId) : "none"} onValueChange={(v) => setForm({ ...form, assigneeId: v === "none" ? undefined : Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {possibleAssignees.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Fecha límite</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className={cn("justify-start text-left font-normal", !form.dueDate && "text-muted-foreground")}> <CalendarIcon className="mr-2 h-4 w-4" /> {form.dueDate ? format(form.dueDate, "PPP", { locale: es }) : <span>Opcional</span>} </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={form.dueDate} onSelect={(d) => setForm({ ...form, dueDate: d })} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={createTask.isPending}>{createTask.isPending ? "Creando..." : "Crear"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
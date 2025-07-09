import { useState, useEffect } from "react";
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
import { useUpdateTask } from "@/hooks/use-tasks";
import type { Task, TeamMember } from "@shared/schema";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  task: Task;
  projectId: number;
  assignees: TeamMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditTaskDialog({ task, projectId, assignees, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const updateTask = useUpdateTask(task.id, projectId);
  const queryClient = useQueryClient();

  const parseDueDate = (raw: unknown): Date | undefined => {
    if (!raw) return undefined;
    if (raw instanceof Date) return raw;
    if (typeof raw === "string") {
      const parsed = new Date(raw);
      if (isNaN(parsed.getTime())) return undefined;
      return parsed;
    }
    return undefined;
  };

  const [form, setForm] = useState<{ title: string; description: string; priority: string; assigneeId: string; dueDate: Date | undefined }>(() => {
    const parsed = parseDueDate(task.dueDate);
    return {
      title: task.title,
      description: task.description || "",
      priority: task.priority || "medium",
      assigneeId: task.assigneeId ? String(task.assigneeId) : "none",
      dueDate: parsed instanceof Date ? parsed : undefined,
    };
  });

  useEffect(() => {
    if (open) {
      const parsed = parseDueDate(task.dueDate);
      setForm({
        title: task.title,
        description: task.description || "",
        priority: task.priority || "medium",
        assigneeId: task.assigneeId ? String(task.assigneeId) : "none",
        dueDate: parsed instanceof Date ? parsed : undefined,
      });
    }
  }, [open, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (updateTask.isPending) return;
    try {
      await updateTask.mutateAsync({
        title: form.title,
        description: form.description,
        priority: form.priority as any,
        assigneeId: form.assigneeId === "none" ? null : Number(form.assigneeId),
        dueDate: form.dueDate ? form.dueDate.toISOString() : undefined,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] }),
        queryClient.invalidateQueries({ queryKey: [`/api/tasks?projectId=${projectId}`] })
      ]);
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["/api/tasks"], type: 'active' }),
        queryClient.refetchQueries({ queryKey: [`/api/tasks?projectId=${projectId}`], type: 'active' })
      ]);
      onOpenChange(false);
      toast({ title: "Tarea actualizada" });
    } catch (err) {
      /* onError ya muestra toast */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar tarea</DialogTitle>
            <DialogDescription>Cambia los detalles de la tarea.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Título</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label>Descripción</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Prioridad</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Asignado</Label>
                <Select value={form.assigneeId} onValueChange={(v) => setForm({ ...form, assigneeId: v })}>
                  <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {assignees.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
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
                  <Calendar
                    mode="single"
                    selected={form.dueDate}
                    onSelect={(d) => setForm({ ...form, dueDate: d instanceof Date ? d : undefined })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={updateTask.isPending}>{updateTask.isPending ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
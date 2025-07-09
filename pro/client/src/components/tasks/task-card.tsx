import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Calendar, Trash } from "lucide-react";
import { format } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTeamMembers } from "@/hooks/use-team";
import type { Task } from "@shared/schema";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useDeleteTask, useCompleteTask } from "@/hooks/use-tasks";
import EditTaskDialog from "@/components/tasks/edit-task-dialog";
import { useState } from "react";

interface TaskCardProps {
  task: Task;
  projectId: number;
  className?: string;
  onEditDialogChange?: (open: boolean) => void;
}

export default function TaskCard({ task, projectId, className, onEditDialogChange }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id.toString()
  });

  const { getTeamMember, teamMembers } = useTeamMembers();
  const assignee = task.assigneeId ? getTeamMember(task.assigneeId) : null;

  const priorityBadge = {
    high: {
      label: "Alta",
      className: "bg-red-100 text-red-800",
    },
    medium: {
      label: "Media",
      className: "bg-blue-100 text-blue-800",
    },
    low: {
      label: "Baja",
      className: "bg-green-100 text-green-800",
    },
  }[task.priority || "medium"];

  const tagBadge = {
    design: {
      label: "Diseño",
      className: "bg-purple-100 text-purple-800",
    },
    development: {
      label: "Desarrollo",
      className: "bg-blue-100 text-blue-800",
    },
    backend: {
      label: "Backend",
      className: "bg-indigo-100 text-indigo-800",
    },
    ux: {
      label: "UX/UI",
      className: "bg-yellow-100 text-yellow-800",
    },
  }[task.title.toLowerCase().includes("diseñ") ? "design" 
    : task.title.toLowerCase().includes("backend") ? "backend"
    : task.title.toLowerCase().includes("ux") ? "ux"
    : "development"];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const deleteTask = useDeleteTask(task.id, projectId);
  const completeTask = useCompleteTask(task.id, projectId);
  const [editOpen, setEditOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleEditClick = () => {
    if (!editOpen) {
      setMenuOpen(false);
      setEditOpen(true);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white p-3 rounded-lg shadow-sm task-card border border-slate-200 cursor-grab active:cursor-grabbing",
        task.completed && "opacity-80",
        className
      )}
    >
      <CardContent className="p-0">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className={tagBadge.className}>
            {tagBadge.label}
          </Badge>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger
              className="text-slate-400 hover:text-slate-600"
              onClick={e => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!task.completed && (
                <DropdownMenuItem onClick={() => { setMenuOpen(false); completeTask.mutate(); }}>
                  Completar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleEditClick}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => { setMenuOpen(false); deleteTask.mutate(); }}>
                <Trash className="h-4 w-4 mr-2" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div {...attributes} {...listeners}>
          <h5 className={cn(
            "text-sm font-medium text-slate-900 mb-1",
            task.completed && "line-through"
          )}>
            {task.title}
          </h5>
        </div>
        <p className="text-xs text-slate-500 mb-3">{task.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {assignee ? (
              <Avatar className="h-5 w-5">
                <AvatarImage src={assignee.avatarUrl ?? undefined} alt={assignee.name} />
                <AvatarFallback className="text-xs">
                  {assignee.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">NA</AvatarFallback>
              </Avatar>
            )}
          </div>
          <div className="text-xs text-slate-500 flex items-center">
            {task.completed ? (
              <span className="flex items-center text-green-500">
                <CheckCircle className="mr-1 h-3 w-3" />
                Completado
              </span>
            ) : task.dueDate ? (
              <>
                <Calendar className="mr-1 h-3 w-3" />
                {format(new Date(task.dueDate), "dd MMM")}
              </>
            ) : (
              <span>Sin fecha</span>
            )}
          </div>
        </div>
      </CardContent>
      <EditTaskDialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setMenuOpen(false);
          if (onEditDialogChange) onEditDialogChange(open);
        }}
        task={task}
        projectId={projectId}
        assignees={teamMembers}
      />
    </Card>
  );
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

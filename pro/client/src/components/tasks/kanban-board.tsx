import { useState } from "react";
import { Button } from "@/components/ui/button";
import TaskCard from "./task-card";
import { Plus } from "lucide-react";
import { useTasksForProject } from "@/hooks/use-tasks";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task } from "@shared/schema";
import { useDroppable } from "@dnd-kit/core";

interface KanbanBoardProps {
  projectId: number;
}

type KanbanColumn = {
  id: string;
  title: string;
  tasks: Task[];
};

function KanbanColumnView({ column, projectId }: { column: KanbanColumn, projectId: number }) {
  const { setNodeRef } = useDroppable({ id: column.id });
  return (
    <div ref={setNodeRef} className="w-72 flex-shrink-0">
      <div className="bg-slate-100 rounded-lg p-3">
        <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center justify-between">
          <span>{column.title}</span>
          <span className="bg-white text-slate-600 text-xs py-0.5 px-2 rounded-full">
            {column.tasks.length}
          </span>
        </h4>

        <SortableContext
          items={column.tasks.map((task) => task.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {column.tasks.map((task) => (
              <TaskCard key={task.id} task={task} projectId={projectId} />
            ))}
            {column.tasks.length === 0 && (
              <div className="text-center py-4 text-sm text-slate-500">No hay tareas</div>
            )}
          </div>
        </SortableContext>

        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200"
        >
          <Plus className="h-4 w-4 mr-1" /> Añadir tarea
        </Button>
      </div>
    </div>
  );
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { tasks, updateTaskStatus } = useTasksForProject(projectId);
  const queryClient = useQueryClient();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group tasks by column
  const columns: KanbanColumn[] = [
    {
      id: "todo",
      title: "Por hacer",
      tasks: tasks.filter(task => task.column === "todo")
        .sort((a, b) => a.order - b.order),
    },
    {
      id: "in-progress",
      title: "En progreso",
      tasks: tasks.filter(task => task.column === "in-progress")
        .sort((a, b) => a.order - b.order),
    },
    {
      id: "review",
      title: "En revisión",
      tasks: tasks.filter(task => task.column === "review")
        .sort((a, b) => a.order - b.order),
    },
    {
      id: "completed",
      title: "Completado",
      tasks: tasks.filter(task => task.column === "completed")
        .sort((a, b) => a.order - b.order),
    },
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = parseInt(active.id.toString());
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Determinar columna destino de forma robusta
    // 1) Preferir id del contenedor droppable
    // @ts-ignore dnd-kit typings
    let overContainer: string | undefined = over?.data?.current?.droppableContainer?.id;

    // 2) Si no existe, deducir del propio over.id
    if (!overContainer) {
      const overId = over.id.toString();
      const possible = ["todo", "in-progress", "review", "completed"];
      if (possible.includes(overId)) {
        overContainer = overId;
      } else {
        const overTask = tasks.find((t) => t.id.toString() === overId);
        overContainer = overTask?.column;
      }
    }

    if (!overContainer) return;

    if (overContainer !== task.column) {
      updateTaskStatus(taskId, overContainer as "todo" | "in-progress" | "review" | "completed", 0);
    }
  };

  // Forzar refetch cuando se cierra el modal de edición de tarea
  const handleEditTaskDialogClose = async (open: boolean) => {
    if (!open) {
      await queryClient.invalidateQueries({ queryKey: [`/api/tasks?projectId=${projectId}`] });
      await queryClient.refetchQueries({ queryKey: [`/api/tasks?projectId=${projectId}`], type: 'active' });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="p-4 overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 min-w-max">
          {columns.map((col) => (
            <KanbanColumnView key={col.id} column={col} projectId={projectId} />
          ))}
        </div>
      </div>
    </DndContext>
  );
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Task, InsertTask } from "@shared/schema";
import React from "react";

export function useTasks() {
  const { toast } = useToast();
  
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["/api/tasks"],
  });

  React.useEffect(() => {
  if (error) {
    toast({
      title: "Error al cargar tareas",
      description: "No se pudieron cargar las tareas. Por favor, intente de nuevo.",
      variant: "destructive",
    });
  }
  }, [error]);

  return {
    tasks: data as Task[],
    isLoading,
  };
}

export function useTasksForProject(projectId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data = [], isLoading, error } = useQuery({
    queryKey: [`/api/tasks?projectId=${projectId}`],
  });

  const updateTaskStatus = async (taskId: number, newColumn: "todo" | "in-progress" | "review" | "completed", newOrder = 0) => {
    try {
      await apiRequest("POST", `/api/tasks/${taskId}/move`, { column: newColumn, order: newOrder });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks?projectId=${projectId}`] });
    } catch (error) {
      toast({
        title: "Error al mover tarea",
        description: "No se pudo actualizar el estado de la tarea.",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
  if (error) {
    toast({
      title: "Error al cargar tareas",
      description: "No se pudieron cargar las tareas del proyecto. Por favor, intente de nuevo.",
      variant: "destructive",
    });
  }
  }, [error]);

  return {
    tasks: data as Task[],
    isLoading,
    updateTaskStatus,
  };
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: (taskData: InsertTask) => 
      apiRequest("POST", "/api/tasks", taskData)
        .then(res => res.json()),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks?projectId=${variables.projectId}`] });
      toast({
        title: "Tarea creada",
        description: "La tarea se ha creado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error al crear tarea",
        description: "No se pudo crear la tarea. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    },
  });

  return mutation;
}

export function useUpdateTask(taskId: number, projectId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: (taskData: Partial<Task>) => 
      apiRequest("PATCH", `/api/tasks/${taskId}`, taskData)
        .then(res => res.json()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      await queryClient.invalidateQueries({ queryKey: [`/api/tasks?projectId=${projectId}`] });
      await queryClient.refetchQueries({ queryKey: ["/api/tasks"] });
      await queryClient.refetchQueries({ queryKey: [`/api/tasks?projectId=${projectId}`] });
      toast({
        title: "Tarea actualizada",
        description: "La tarea se ha actualizado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error al actualizar tarea",
        description: "No se pudo actualizar la tarea. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    },
  });

  return mutation;
}

export function useCompleteTask(taskId: number, projectId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: () => 
      apiRequest("PATCH", `/api/tasks/${taskId}`, { 
        completed: true, 
        status: "completed",
        column: "completed"
      })
      .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks?projectId=${projectId}`] });
      toast({
        title: "Tarea completada",
        description: "La tarea se ha marcado como completada.",
      });
    },
    onError: () => {
      toast({
        title: "Error al completar tarea",
        description: "No se pudo completar la tarea. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    },
  });

  return mutation;
}

export function useDeleteTask(taskId: number, projectId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: () => 
      apiRequest("DELETE", `/api/tasks/${taskId}`).then(() => taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks?projectId=${projectId}`] });
      toast({
        title: "Tarea eliminada",
        description: "La tarea se ha eliminado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error al eliminar tarea",
        description: "No se pudo eliminar la tarea. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    },
  });

  return mutation;
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Milestone } from "@shared/schema";
import React from "react";

interface ProjectStats {
  activeProjects: number;
  completedProjects: number;
  pendingTasks: number;
  completedTasks: number;
  timeSpent: number;
  productivity: number;
}

export function useProjectStats() {
  const { toast } = useToast();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/stats"],
  });

  React.useEffect(() => {
  if (error) {
    toast({
      title: "Error al cargar estadísticas",
      description: "No se pudieron cargar las estadísticas. Por favor, intente de nuevo.",
      variant: "destructive",
    });
  }
  }, [error]);

  return {
    stats: (data || {
      activeProjects: 0,
      completedProjects: 0,
      pendingTasks: 0,
      completedTasks: 0,
      timeSpent: 0,
      productivity: 0
    }) as ProjectStats,
    isLoading,
  };
}

export function useMilestones(projectId?: number) {
  const { toast } = useToast();
  
  const queryKey = projectId 
    ? [`/api/milestones?projectId=${projectId}`]
    : ["/api/milestones"];
  
  const { data = [], isLoading, error } = useQuery({
    queryKey,
  });

  React.useEffect(() => {
  if (error) {
    toast({
      title: "Error al cargar hitos",
      description: "No se pudieron cargar los hitos del proyecto. Por favor, intente de nuevo.",
      variant: "destructive",
    });
  }
  }, [error]);

  return {
    milestones: data as Milestone[],
    isLoading,
  };
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createMilestone = async (milestone: {
    projectId: number;
    title: string;
    date: Date;
  }) => {
    try {
      await apiRequest("POST", "/api/milestones", milestone);
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/milestones?projectId=${milestone.projectId}`] 
      });
      toast({
        title: "Hito creado",
        description: "El hito se ha creado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error al crear hito",
        description: "No se pudo crear el hito. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  return { createMilestone };
}

export function useUpdateMilestone(id: number, projectId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const updateMilestone = async (milestone: Partial<Milestone>) => {
    try {
      await apiRequest("PATCH", `/api/milestones/${id}`, milestone);
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/milestones?projectId=${projectId}`] 
      });
      toast({
        title: "Hito actualizado",
        description: "El hito se ha actualizado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error al actualizar hito",
        description: "No se pudo actualizar el hito. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  return { updateMilestone };
}

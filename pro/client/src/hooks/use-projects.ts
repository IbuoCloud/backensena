import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, InsertProject } from "@shared/schema";
import React from "react";

export function useProjects() {
  const { toast } = useToast();
  
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["/api/projects"],
  });

  React.useEffect(() => {
  if (error) {
    toast({
      title: "Error al cargar proyectos",
      description: "No se pudieron cargar los proyectos. Por favor, intente de nuevo.",
      variant: "destructive",
    });
  }
  }, [error]);

  return {
    projects: data as Project[],
    isLoading,
  };
}

export function useProject(id: number) {
  const { toast } = useToast();
  
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/projects/${id}`],
  });

  React.useEffect(() => {
  if (error) {
    toast({
      title: "Error al cargar proyecto",
      description: "No se pudo cargar el proyecto. Por favor, intente de nuevo.",
      variant: "destructive",
    });
  }
  }, [error]);

  return {
    project: data as Project | undefined,
    isLoading,
  };
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: (projectData: InsertProject) => 
      apiRequest("POST", "/api/projects", projectData)
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Proyecto creado",
        description: "El proyecto se ha creado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error al crear proyecto",
        description: "No se pudo crear el proyecto. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    },
  });

  return mutation;
}

export function useUpdateProject(id: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: (projectData: Partial<Project>) => 
      apiRequest("PUT", `/api/projects/${id}`, projectData)
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      toast({
        title: "Proyecto actualizado",
        description: "El proyecto se ha actualizado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error al actualizar proyecto",
        description: "No se pudo actualizar el proyecto. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    },
  });

  return mutation;
}

export function useDeleteProject(id: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: () => 
      apiRequest("DELETE", `/api/projects/${id}`).then(() => id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto se ha eliminado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error al eliminar proyecto",
        description: "No se pudo eliminar el proyecto. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    },
  });

  return mutation;
}

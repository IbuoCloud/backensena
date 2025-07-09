import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TeamMember, InsertTeamMember } from "@shared/schema";
import React from "react";

export function useTeamMembers() {
  const { toast } = useToast();
  
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["/api/team"],
  });

  React.useEffect(() => {
  if (error) {
    toast({
      title: "Error al cargar miembros del equipo",
      description: "No se pudieron cargar los miembros del equipo. Por favor, intente de nuevo.",
      variant: "destructive",
    });
  }
  }, [error]);

  const getTeamMember = (id: number): TeamMember | undefined => {
    return (data as TeamMember[]).find(member => member.id === id);
  };

  const getTeamMembersByIds = (ids: number[]): TeamMember[] => {
    return (data as TeamMember[]).filter(member => ids.includes(member.id));
  };

  return {
    teamMembers: data as TeamMember[],
    isLoading,
    getTeamMember,
    getTeamMembersByIds,
  };
}

export function useCreateTeamMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: (memberData: InsertTeamMember) => 
      apiRequest("POST", "/api/team", memberData)
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Miembro creado",
        description: "El miembro del equipo se ha creado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error al crear miembro",
        description: "No se pudo crear el miembro del equipo. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    },
  });

  return mutation;
}

export function useUpdateTeamMember(id: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: (memberData: Partial<TeamMember>) => 
      apiRequest("PATCH", `/api/team/${id}`, memberData)
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Miembro actualizado",
        description: "El miembro del equipo se ha actualizado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error al actualizar miembro",
        description: "No se pudo actualizar el miembro del equipo. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    },
  });

  return mutation;
}

export function useDeleteTeamMember(id: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: () => 
      apiRequest("DELETE", `/api/team/${id}`).then(() => id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Miembro eliminado",
        description: "El miembro del equipo se ha eliminado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error al eliminar miembro",
        description: "No se pudo eliminar el miembro del equipo. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    },
  });

  return mutation;
}

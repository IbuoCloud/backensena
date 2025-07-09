import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Team } from "@shared/schema";

export function useTeams() {
  const { toast } = useToast();
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/teams"],
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error al cargar equipos",
        description: "No se pudieron cargar los equipos. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  }, [error]);

  return { teams: data as Team[], isLoading };
} 
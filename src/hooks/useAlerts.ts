import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrationssupabase/client";
import { useEffect } from "react";

export interface Alert {
  id: string;
  device_id: string;
  temperature: number;
  status: "adequado" | "precario" | "critico";
  message: string | null;
  acknowledged: boolean | null;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  created_at: string | null;
  // Joined data from devices table
  device?: {
    id: string;
    name: string;
    serial_number: string;
    location: string;
  };
}

export interface AlertFilters {
  status?: "adequado" | "precario" | "critico";
  acknowledged?: boolean;
  deviceId?: string;
}

export const useAlerts = (filters?: AlertFilters, limit: number = 100, enableRealtime: boolean = true) => {
  const queryClient = useQueryClient();
  const queryKey = ["alerts", filters, limit];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from("alerts")
        .select(`
          *,
          device:devices(id, name, serial_number, location)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.acknowledged !== undefined) {
        query = query.eq("acknowledged", filters.acknowledged);
      }

      if (filters?.deviceId) {
        query = query.eq("device_id", filters.deviceId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Alert[];
    },
    refetchInterval: enableRealtime ? 10000 : false, // Fallback: refetch every 10 seconds
  });

  // Realtime subscription
  useEffect(() => {
    if (!enableRealtime) return;

    const channel = supabase
      .channel('alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
        },
        (payload) => {
          console.log('🔔 Alert update:', payload);
          // Invalidate both alerts and stats queries
          queryClient.invalidateQueries({ queryKey: ["alerts"] });
          queryClient.invalidateQueries({ queryKey: ["alerts-stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, queryClient]);

  return query;
};

export const useAlertsStats = (enableRealtime: boolean = true) => {
  const queryClient = useQueryClient();
  const queryKey = ["alerts-stats"];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("status, acknowledged");

      if (error) throw error;

      const stats = {
        total: data.length,
        unacknowledged: data.filter((a) => !a.acknowledged).length,
        critico: data.filter((a) => a.status === "critico").length,
        precario: data.filter((a) => a.status === "precario").length,
        adequado: data.filter((a) => a.status === "adequado").length,
        criticoUnack: data.filter((a) => a.status === "critico" && !a.acknowledged).length,
        precarioUnack: data.filter((a) => a.status === "precario" && !a.acknowledged).length,
      };

      return stats;
    },
    refetchInterval: enableRealtime ? 10000 : false,
  });

  // Realtime subscription for stats
  useEffect(() => {
    if (!enableRealtime) return;

    const channel = supabase
      .channel('alerts_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
        },
        (payload) => {
          console.log('📊 Stats update:', payload);
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, queryClient, queryKey]);

  return query;
};

export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, acknowledgedBy }: { alertId: string; acknowledgedBy: string }) => {
      const { data, error } = await supabase
        .from("alerts")
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: acknowledgedBy,
        })
        .eq("id", alertId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch alerts queries
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-stats"] });
    },
  });
};

export const useAcknowledgeMultipleAlerts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertIds, acknowledgedBy }: { alertIds: string[]; acknowledgedBy: string }) => {
      const { data, error } = await supabase
        .from("alerts")
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: acknowledgedBy,
        })
        .in("id", alertIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-stats"] });
    },
  });
};


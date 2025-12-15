import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrationssupabase/client";
import { useEffect } from "react";

export interface TemperatureReading {
  id: string;
  device_id: string;
  temperature: number;
  status: "adequado" | "precario" | "critico";
  timestamp: string;
  created_at: string;
}

export const useTemperatureReadings = (deviceId?: string, limit: number = 100, enableRealtime: boolean = true) => {
  const queryClient = useQueryClient();
  const queryKey = ["temperature_readings", deviceId, limit];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from("temperature_readings")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (deviceId) {
        query = query.eq("device_id", deviceId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TemperatureReading[];
    },
    refetchInterval: enableRealtime ? 10000 : false, // Fallback: refetch every 10 seconds
  });

  // Realtime subscription
  useEffect(() => {
    if (!enableRealtime) return;

    const channel = supabase
      .channel('temperature_readings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'temperature_readings',
          filter: deviceId ? `device_id=eq.${deviceId}` : undefined,
        },
        (payload) => {
          console.log('🔥 Realtime update:', payload);
          // Invalidate and refetch the query
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deviceId, enableRealtime, queryClient, queryKey]);

  return query;
};

export const useLatestReading = (deviceId: string, enableRealtime: boolean = true) => {
  const queryClient = useQueryClient();
  const queryKey = ["latest_reading", deviceId];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("temperature_readings")
        .select("*")
        .eq("device_id", deviceId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data as TemperatureReading;
    },
    enabled: !!deviceId,
    refetchInterval: enableRealtime ? 5000 : false, // Fallback: refetch every 5 seconds
  });

  // Realtime subscription for latest reading
  useEffect(() => {
    if (!enableRealtime || !deviceId) return;

    const channel = supabase
      .channel(`latest_reading_${deviceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'temperature_readings',
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          console.log('🌡️ Latest reading update:', payload);
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deviceId, enableRealtime, queryClient, queryKey]);

  return query;
};

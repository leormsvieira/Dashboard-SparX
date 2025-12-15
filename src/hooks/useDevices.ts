import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrationssupabase/client";
import { useEffect } from "react";

export interface Device {
  id: string;
  serial_number: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  model: string | null;
  installation_date: string | null;
  last_reading_at: string | null;
  current_status: "adequado" | "precario" | "critico";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useDevices = (enableRealtime: boolean = true) => {
  const queryClient = useQueryClient();
  const queryKey = ["devices"];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as Device[];
    },
    refetchInterval: enableRealtime ? 30000 : false, // Refetch every 30 seconds
  });

  // Realtime subscription
  useEffect(() => {
    if (!enableRealtime) return;

    const channel = supabase
      .channel('devices_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devices',
        },
        (payload) => {
          console.log('📱 Device update:', payload);
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

export const useDevice = (deviceId: string) => {
  return useQuery({
    queryKey: ["device", deviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .eq("id", deviceId)
        .single();

      if (error) throw error;
      return data as Device;
    },
    enabled: !!deviceId,
  });
};

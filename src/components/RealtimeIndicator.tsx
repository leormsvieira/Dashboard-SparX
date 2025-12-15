import { useEffect, useState } from "react";
import { supabase } from "@/integrationssupabase/client";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export const RealtimeIndicator = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Monitor connection status
    const channel = supabase.channel('connection_monitor');

    channel
      .on('system', {}, (payload) => {
        if (payload.extension === 'postgres_changes') {
          setIsConnected(true);
          setLastUpdate(new Date());
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-2 transition-all duration-300",
        isConnected
          ? "bg-status-adequado/10 text-status-adequado border-status-adequado/30"
          : "bg-muted text-muted-foreground border-border"
      )}
    >
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3 animate-pulse" />
          <span className="text-xs">Tempo Real</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span className="text-xs">Offline</span>
        </>
      )}
    </Badge>
  );
};


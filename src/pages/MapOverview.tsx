import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapView } from "@/components/MapView";
import { useDevices } from "@/hooks/useDevices";
import { useAlertsStats } from "@/hooks/useAlerts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MapOverview() {
  const navigate = useNavigate();
  const { data: devices, isLoading: devicesLoading, error } = useDevices();
  const { data: alertsStats } = useAlertsStats();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>();

  // Debug
  console.log("🗺️ MapOverview - Devices:", devices);
  console.log("🗺️ MapOverview - Loading:", devicesLoading);
  console.log("🗺️ MapOverview - Error:", error);

  if (devicesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-destructive text-lg">Erro ao carregar dispositivos</p>
          <p className="text-muted-foreground text-sm mt-2">{String(error)}</p>
        </div>
      </div>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Nenhum dispositivo encontrado</p>
          <p className="text-sm mt-2">Execute a migration SQL para adicionar dispositivos de teste</p>
        </div>
      </div>
    );
  }

  // Estatísticas dos dispositivos
  const totalDevices = devices?.length || 0;
  const criticalDevices = devices?.filter((d) => d.current_status === "critico").length || 0;
  const warningDevices = devices?.filter((d) => d.current_status === "precario").length || 0;
  const normalDevices = devices?.filter((d) => d.current_status === "adequado").length || 0;

  const stats = [
    {
      label: "Total de Transformadores",
      value: totalDevices,
      icon: MapPin,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Status Crítico",
      value: criticalDevices,
      icon: XCircle,
      color: "text-status-critico",
      bgColor: "bg-status-critico/10",
    },
    {
      label: "Status Precário",
      value: warningDevices,
      icon: AlertTriangle,
      color: "text-status-precario",
      bgColor: "bg-status-precario/10",
    },
    {
      label: "Status Adequado",
      value: normalDevices,
      icon: CheckCircle,
      color: "text-status-adequado",
      bgColor: "bg-status-adequado/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SparX
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitoramento em tempo real dos transformadores da Copel
              </p>
            </div>
            {alertsStats && alertsStats.unacknowledged > 0 && (
              <Badge
                variant="destructive"
                className="text-lg px-4 py-2 cursor-pointer hover:bg-destructive/80 transition-colors"
                onClick={() => navigate("/alerts")}
              >
                {alertsStats.unacknowledged} Alertas Pendentes
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="p-4 hover:shadow-lg transition-shadow duration-200 border-border bg-card"
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Mapa */}
        <Card className="p-0 overflow-hidden border-border bg-card">
          <div className="h-[calc(100vh-320px)] min-h-[500px]">
            {devices && (
              <MapView
                devices={devices}
                selectedDeviceId={selectedDeviceId}
                onDeviceSelect={setSelectedDeviceId}
              />
            )}
          </div>
        </Card>

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-status-adequado"></div>
            <span className="text-muted-foreground">Adequado (&lt; 51°C)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-status-precario"></div>
            <span className="text-muted-foreground">Precário (51-60°C)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-status-critico"></div>
            <span className="text-muted-foreground">Crítico (&gt; 60°C)</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/30">
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
            <span className="text-primary font-medium">Protótipo Funcional</span>
          </div>
        </div>

        {/* Instruções */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground text-center">
            <strong></strong> Clique em qualquer marcador no mapa para ver detalhes do transformador e acessar o monitoramento em tempo real.
          </p>
        </div>
      </div>
    </div>
  );
}


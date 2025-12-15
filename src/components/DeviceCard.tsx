import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Activity, Calendar } from "lucide-react";
import { Device } from "@/hooks/useDevices";
import { cn } from "@/lib/utils";

interface DeviceCardProps {
  device: Device;
  onClick?: () => void;
  className?: string;
}

export const DeviceCard = ({ device, onClick, className }: DeviceCardProps) => {
  const getStatusColor = () => {
    switch (device.current_status) {
      case "adequado":
        return "bg-status-adequado/20 text-status-adequado border-status-adequado/30";
      case "precario":
        return "bg-status-precario/20 text-status-precario border-status-precario/30";
      case "critico":
        return "bg-status-critico/20 text-status-critico border-status-critico/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = () => {
    const labels = {
      adequado: "Adequado",
      precario: "Precário",
      critico: "Crítico",
    };
    return labels[device.current_status] || device.current_status;
  };

  return (
    <Card
      className={cn(
        "p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-display font-bold group-hover:text-primary transition-colors">
              {device.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{device.serial_number}</p>
          </div>
          <Badge className={`${getStatusColor()} border`}>
            {getStatusLabel()}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{device.location}</span>
          </div>
          
          {device.last_reading_at && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="w-4 h-4" />
              <span>
                Última leitura:{" "}
                {new Date(device.last_reading_at).toLocaleString("pt-BR")}
              </span>
            </div>
          )}
          
          {device.installation_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Instalado em:{" "}
                {new Date(device.installation_date).toLocaleDateString("pt-BR")}
              </span>
            </div>
          )}
        </div>

        {/* Model Badge */}
        {device.model && (
          <div>
            <Badge variant="outline" className="text-xs">
              {device.model}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, CheckCircle2, MapPin, Thermometer, Clock, User } from "lucide-react";
import { Alert } from "@/hooks/useAlerts";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (alertId: string) => void;
  isAcknowledging?: boolean;
}

export const AlertCard = ({ alert, onAcknowledge, isAcknowledging }: AlertCardProps) => {
  const getStatusConfig = () => {
    switch (alert.status) {
      case "critico":
        return {
          icon: AlertCircle,
          color: "text-status-critico",
          bgColor: "bg-status-critico/10",
          borderColor: "border-status-critico/30",
          badgeClass: "bg-status-critico/20 text-status-critico border-status-critico/30",
          label: "Crítico",
        };
      case "precario":
        return {
          icon: AlertTriangle,
          color: "text-status-precario",
          bgColor: "bg-status-precario/10",
          borderColor: "border-status-precario/30",
          badgeClass: "bg-status-precario/20 text-status-precario border-status-precario/30",
          label: "Precário",
        };
      case "adequado":
        return {
          icon: CheckCircle2,
          color: "text-status-adequado",
          bgColor: "bg-status-adequado/10",
          borderColor: "border-status-adequado/30",
          badgeClass: "bg-status-adequado/20 text-status-adequado border-status-adequado/30",
          label: "Adequado",
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-muted-foreground",
          bgColor: "bg-muted/10",
          borderColor: "border-muted",
          badgeClass: "bg-muted text-muted-foreground",
          label: "Desconhecido",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <Card
      className={cn(
        "p-6 bg-card border-2 transition-all duration-300",
        alert.acknowledged ? "border-border opacity-60" : statusConfig.borderColor,
        !alert.acknowledged && "hover:shadow-lg"
      )}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn("p-2 rounded-lg", statusConfig.bgColor)}>
              <StatusIcon className={cn("w-6 h-6", statusConfig.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-display font-bold">
                  {alert.device?.name || "Dispositivo Desconhecido"}
                </h3>
                <Badge className={cn(statusConfig.badgeClass, "border")}>
                  {statusConfig.label}
                </Badge>
                {alert.acknowledged && (
                  <Badge variant="outline" className="bg-muted/50">
                    Reconhecido
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {alert.device?.serial_number}
              </p>
            </div>
          </div>

          {/* Temperature Display */}
          <div className={cn("text-right p-3 rounded-lg", statusConfig.bgColor)}>
            <div className="flex items-center gap-2">
              <Thermometer className={cn("w-5 h-5", statusConfig.color)} />
              <span className={cn("text-2xl font-display font-bold", statusConfig.color)}>
                {alert.temperature.toFixed(1)}°C
              </span>
            </div>
          </div>
        </div>

        {/* Message */}
        {alert.message && (
          <div className={cn("p-3 rounded-lg border", statusConfig.bgColor, statusConfig.borderColor)}>
            <p className="text-sm font-medium">{alert.message}</p>
          </div>
        )}

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {alert.device?.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{alert.device.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {alert.created_at
                ? new Date(alert.created_at).toLocaleString("pt-BR")
                : "Data desconhecida"}
            </span>
          </div>

          {alert.acknowledged && alert.acknowledged_by && (
            <div className="flex items-center gap-2 text-muted-foreground md:col-span-2">
              <User className="w-4 h-4" />
              <span>
                Reconhecido por {alert.acknowledged_by}
                {alert.acknowledged_at && (
                  <> em {new Date(alert.acknowledged_at).toLocaleString("pt-BR")}</>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        {!alert.acknowledged && onAcknowledge && (
          <div className="pt-2 border-t border-border">
            <Button
              onClick={() => onAcknowledge(alert.id)}
              disabled={isAcknowledging}
              className="w-full"
              variant="outline"
            >
              {isAcknowledging ? "Reconhecendo..." : "Reconhecer Alerta"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};


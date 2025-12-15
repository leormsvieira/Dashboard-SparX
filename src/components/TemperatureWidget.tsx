import { Thermometer } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TemperatureWidgetProps {
  temperature: number;
  lastUpdate: string;
  status: "adequado" | "precario" | "critico";
}

export const TemperatureWidget = ({ temperature, lastUpdate, status }: TemperatureWidgetProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "adequado":
        return "text-status-adequado";
      case "precario":
        return "text-status-precario";
      case "critico":
        return "text-status-critico";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Thermometer className={`w-16 h-16 ${getStatusColor()}`} />
          <div className="absolute inset-0 blur-xl opacity-50">
            <Thermometer className={`w-16 h-16 ${getStatusColor()}`} />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <div className={`text-5xl font-display font-bold ${getStatusColor()}`}>
            {temperature.toFixed(2)}°C
          </div>
          <div className="text-sm text-muted-foreground">
            Última Atualização: {new Date(lastUpdate).toLocaleString("pt-BR")}
          </div>
        </div>
      </div>
    </Card>
  );
};

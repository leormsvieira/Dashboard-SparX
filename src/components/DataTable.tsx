import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TemperatureReading } from "@/hooks/useTemperatureReadings";

interface DataTableProps {
  data: TemperatureReading[];
  title?: string;
}

export const DataTable = ({ data, title = "Tabela de Valores" }: DataTableProps) => {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      adequado: "bg-status-adequado/20 text-status-adequado border-status-adequado/30",
      precario: "bg-status-precario/20 text-status-precario border-status-precario/30",
      critico: "bg-status-critico/20 text-status-critico border-status-critico/30",
    };

    const labels: Record<string, string> = {
      adequado: "Adequado",
      precario: "Precário",
      critico: "Crítico",
    };

    return (
      <Badge className={`${variants[status] || ""} border`}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-display font-semibold mb-4">{title}</h3>
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-display">Temperatura</TableHead>
              <TableHead className="font-display">Status</TableHead>
              <TableHead className="font-display">Data e Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 10).map((reading) => (
              <TableRow key={reading.id} className="hover:bg-muted/30">
                <TableCell className="font-semibold text-primary">
                  {parseFloat(reading.temperature.toString()).toFixed(2)}°C
                </TableCell>
                <TableCell>{getStatusBadge(reading.status)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(reading.timestamp).toLocaleString("pt-BR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

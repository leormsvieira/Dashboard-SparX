import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TemperatureReading } from "@/hooks/useTemperatureReadings";

interface TemperatureLineChartProps {
  data: TemperatureReading[];
  title?: string;
}

export const TemperatureLineChart = ({ data, title = "Histórico de Temperatura" }: TemperatureLineChartProps) => {
  // Transform data for chart
  const chartData = data
    .slice()
    .reverse()
    .map((reading) => ({
      time: new Date(reading.timestamp).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      temperature: parseFloat(reading.temperature.toString()),
      fullDate: new Date(reading.timestamp).toLocaleString("pt-BR"),
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold">{payload[0].payload.fullDate}</p>
          <p className="text-lg font-display font-bold text-primary">
            {payload[0].value.toFixed(2)}°C
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-display font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Reference lines for thresholds */}
          <ReferenceLine
            y={51}
            stroke="hsl(var(--status-precario))"
            strokeDasharray="3 3"
            label={{ value: "Precário", fill: "hsl(var(--status-precario))", fontSize: 12 }}
          />
          <ReferenceLine
            y={60}
            stroke="hsl(var(--status-critico))"
            strokeDasharray="3 3"
            label={{ value: "Crítico", fill: "hsl(var(--status-critico))", fontSize: 12 }}
          />
          
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", r: 3 }}
            activeDot={{ r: 6, fill: "hsl(var(--secondary))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

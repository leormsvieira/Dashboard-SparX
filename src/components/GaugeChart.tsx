import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface GaugeChartProps {
  value: number;
  max?: number;
  title?: string;
}

export const GaugeChart = ({ value, max = 100, title = "Temperatura" }: GaugeChartProps) => {
  // Calculate percentage
  const percentage = Math.min((value / max) * 100, 100);
  
  // Determine color based on thresholds
  const getColor = () => {
    if (value <= 51) return "hsl(var(--status-adequado))";
    if (value <= 60) return "hsl(var(--status-precario))";
    return "hsl(var(--status-critico))";
  };

  // Create data for semi-circle gauge
  const data = [
    { value: percentage, fill: getColor() },
    { value: 100 - percentage, fill: "hsl(var(--muted))" },
  ];

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-display font-semibold mb-4">{title}</h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="90%"
              paddingAngle={0}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Value display in center */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-3xl font-display font-bold" style={{ color: getColor() }}>
            {value.toFixed(1)}°C
          </div>
        </div>
        
        {/* Scale markers */}
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>0°C</span>
          <span>51°C</span>
          <span>60°C</span>
          <span>{max}°C</span>
        </div>
      </div>
    </Card>
  );
};

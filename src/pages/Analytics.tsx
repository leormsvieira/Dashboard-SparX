import { Header } from "@/components/Header";
import { TemperatureLineChart } from "@/components/TemperatureLineChart";
import { DataTable } from "@/components/DataTable";
import { Card } from "@/components/ui/card";
import { useTemperatureReadings } from "@/hooks/useTemperatureReadings";
import { useDevices } from "@/hooks/useDevices";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const Analytics = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
  const { data: devices, isLoading: devicesLoading } = useDevices();
  const { data: readings, isLoading: readingsLoading } = useTemperatureReadings(
    selectedDeviceId,
    200
  );

  // Calculate statistics
  const stats = readings
    ? {
        avg: readings.reduce((acc, r) => acc + parseFloat(r.temperature.toString()), 0) / readings.length,
        max: Math.max(...readings.map((r) => parseFloat(r.temperature.toString()))),
        min: Math.min(...readings.map((r) => parseFloat(r.temperature.toString()))),
        count: readings.length,
      }
    : null;

  if (devicesLoading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-96" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Análise de Dados
          </h1>
          <p className="text-muted-foreground">
            Visualize e analise o histórico de temperatura dos transformadores
          </p>
        </div>

        {/* Device Selector */}
        <Card className="p-6 mb-6 bg-card border-border">
          <label className="block text-sm font-medium mb-2">Selecionar Dispositivo</label>
          <Select
            value={selectedDeviceId || "all"}
            onValueChange={(value) => setSelectedDeviceId(value === "all" ? undefined : value)}
          >
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Todos os dispositivos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os dispositivos</SelectItem>
              {devices?.map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  {device.name} ({device.serial_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Média</p>
                  <p className="text-2xl font-display font-bold">{stats.avg.toFixed(2)}°C</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-status-critico" />
                <div>
                  <p className="text-sm text-muted-foreground">Máxima</p>
                  <p className="text-2xl font-display font-bold">{stats.max.toFixed(2)}°C</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-8 h-8 text-status-adequado" />
                <div>
                  <p className="text-sm text-muted-foreground">Mínima</p>
                  <p className="text-2xl font-display font-bold">{stats.min.toFixed(2)}°C</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Leituras</p>
                  <p className="text-2xl font-display font-bold">{stats.count}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Charts */}
        {readingsLoading ? (
          <Skeleton className="h-96" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TemperatureLineChart data={readings || []} title="Histórico Detalhado" />
            </div>
            <div className="lg:col-span-1">
              <DataTable data={readings || []} title="Últimas Leituras" />
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Analytics;

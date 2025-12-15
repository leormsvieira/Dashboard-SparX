import { Header } from "@/components/Header";
import { DeviceCard } from "@/components/DeviceCard";
import { useDevices } from "@/hooks/useDevices";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, AlertCircle, CheckCircle, AlertTriangle, Filter, MapPin } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTemperatureReadings } from "@/hooks/useTemperatureReadings";
import { TemperatureLineChart } from "@/components/TemperatureLineChart";
import { GaugeChart } from "@/components/GaugeChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Devices = () => {
  const { data: devices, isLoading } = useDevices();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: deviceReadings } = useTemperatureReadings(selectedDeviceId || undefined, 50);

  const selectedDevice = devices?.find((d) => d.id === selectedDeviceId);
  const latestReading = deviceReadings?.[0];

  // Extract unique cities from devices
  const cities = useMemo(() => {
    if (!devices) return [];
    const citySet = new Set<string>();
    devices.forEach((device) => {
      const city = device.location.split(" - ")[0]; // Extract city name before " - "
      citySet.add(city);
    });
    return Array.from(citySet).sort();
  }, [devices]);

  // Filter devices based on selected filters
  const filteredDevices = useMemo(() => {
    if (!devices) return [];

    return devices.filter((device) => {
      const cityMatch = cityFilter === "all" || device.location.startsWith(cityFilter);
      const statusMatch = statusFilter === "all" || device.current_status === statusFilter;
      return cityMatch && statusMatch;
    });
  }, [devices, cityFilter, statusFilter]);

  // Calculate overview stats from filtered devices
  const stats = filteredDevices
    ? {
        total: filteredDevices.length,
        adequado: filteredDevices.filter((d) => d.current_status === "adequado").length,
        precario: filteredDevices.filter((d) => d.current_status === "precario").length,
        critico: filteredDevices.filter((d) => d.current_status === "critico").length,
      }
    : null;

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
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
            Dispositivos IoT
          </h1>
          <p className="text-muted-foreground">
            Gerencie e monitore todos os transformadores conectados
          </p>
        </div>

        {/* Overview Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-3xl font-display font-bold">{stats.total}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-status-adequado" />
                <div>
                  <p className="text-sm text-muted-foreground">Adequado</p>
                  <p className="text-3xl font-display font-bold">{stats.adequado}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-status-precario" />
                <div>
                  <p className="text-sm text-muted-foreground">Precário</p>
                  <p className="text-3xl font-display font-bold">{stats.precario}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-status-critico" />
                <div>
                  <p className="text-sm text-muted-foreground">Crítico</p>
                  <p className="text-3xl font-display font-bold">{stats.critico}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-6 mb-6 bg-card border-border">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Filtros</h2>
            </div>
            {(cityFilter !== "all" || statusFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCityFilter("all");
                  setStatusFilter("all");
                }}
                className="text-xs"
              >
                Limpar filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* City Filter */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Cidade
              </label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as cidades" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="adequado">Adequado</SelectItem>
                  <SelectItem value="precario">Precário</SelectItem>
                  <SelectItem value="critico">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Results Counter */}
        {filteredDevices && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{filteredDevices.length}</span>{" "}
              {filteredDevices.length === 1 ? "dispositivo" : "dispositivos"}
              {cityFilter !== "all" && (
                <span> em <span className="font-semibold text-primary">{cityFilter}</span></span>
              )}
            </p>
          </div>
        )}

        {/* Devices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices?.map((device) => {
            const isPrototype = device.serial_number === "esp32-transformador-prototype";
            return (
              <div key={device.id} className="relative">
                {isPrototype && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <Badge className="bg-primary text-primary-foreground shadow-lg animate-pulse">
                      🟠 Protótipo Funcional
                    </Badge>
                  </div>
                )}
                <DeviceCard
                  device={device}
                  onClick={() => setSelectedDeviceId(device.id)}
                  className={isPrototype ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                />
              </div>
            );
          })}
        </div>

        {/* Device Details Dialog */}
        <Dialog open={!!selectedDeviceId} onOpenChange={() => setSelectedDeviceId(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">
                {selectedDevice?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedDevice && (
              <div className="space-y-6">
                {/* Device Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Número de Série</p>
                    <p className="font-semibold">{selectedDevice.serial_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Localização</p>
                    <p className="font-semibold">{selectedDevice.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Modelo</p>
                    <p className="font-semibold">{selectedDevice.model || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status Atual</p>
                    <Badge
                      className={
                        selectedDevice.current_status === "adequado"
                          ? "bg-status-adequado/20 text-status-adequado"
                          : selectedDevice.current_status === "precario"
                          ? "bg-status-precario/20 text-status-precario"
                          : "bg-status-critico/20 text-status-critico"
                      }
                    >
                      {selectedDevice.current_status === "adequado"
                        ? "Adequado"
                        : selectedDevice.current_status === "precario"
                        ? "Precário"
                        : "Crítico"}
                    </Badge>
                  </div>
                </div>

                {/* Charts */}
                {latestReading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GaugeChart
                      value={parseFloat(latestReading.temperature.toString())}
                      title="Temperatura Atual"
                    />
                    <TemperatureLineChart
                      data={deviceReadings || []}
                      title="Histórico Recente"
                    />
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
};

export default Devices;

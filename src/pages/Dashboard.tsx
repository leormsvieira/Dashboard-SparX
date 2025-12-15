import { Header } from "@/components/Header";
import { TemperatureWidget } from "@/components/TemperatureWidget";
import { GaugeChart } from "@/components/GaugeChart";
import { TemperatureLineChart } from "@/components/TemperatureLineChart";
import { DataTable } from "@/components/DataTable";
import { useDevices } from "@/hooks/useDevices";
import { useTemperatureReadings } from "@/hooks/useTemperatureReadings";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const deviceIdFromUrl = searchParams.get("device");

  const { data: devices, isLoading: devicesLoading } = useDevices();
  const { data: readings, isLoading: readingsLoading } = useTemperatureReadings(deviceIdFromUrl || undefined, 50);

  // Get the selected device from URL or fallback to first device
  const selectedDevice = deviceIdFromUrl
    ? devices?.find(d => d.id === deviceIdFromUrl)
    : devices?.[0];

  // Get latest reading for the selected device
  const latestReading = readings?.[0];

  if (devicesLoading || readingsLoading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-96 lg:col-span-2" />
          </div>
        </main>
      </>
    );
  }

  if (!selectedDevice || !latestReading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <AlertCircle className="w-16 h-16 text-muted-foreground" />
            <h2 className="text-2xl font-display font-bold">Nenhum dado disponível</h2>
            <p className="text-muted-foreground">
              Aguardando dados dos dispositivos IoT...
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="bg-gradient-primary p-8 rounded-2xl shadow-glow-orange">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-2">
              {selectedDevice.name}
            </h1>
            <p className="text-lg text-primary-foreground/90">
              {selectedDevice.location} • {selectedDevice.serial_number}
            </p>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TemperatureWidget
            temperature={parseFloat(latestReading.temperature.toString())}
            lastUpdate={latestReading.timestamp}
            status={latestReading.status}
          />
          <GaugeChart
            value={parseFloat(latestReading.temperature.toString())}
            max={100}
            title="Temperatura"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TemperatureLineChart data={readings || []} />
          </div>
          <div className="lg:col-span-1">
            <DataTable data={readings || []} />
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;

import { SimpleMap } from "@/components/SimpleMap";
import { useDevices } from "@/hooks/useDevices";
import { Loader2 } from "lucide-react";

export default function TestMap() {
  const { data: devices, isLoading, error } = useDevices();

  if (isLoading) {
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
          <p className="text-destructive">Erro: {String(error)}</p>
        </div>
      </div>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Nenhum dispositivo encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Teste de Mapa Simples</h1>
      <p className="mb-4">Dispositivos: {devices.length}</p>
      <p className="mb-4">
        Com coordenadas: {devices.filter(d => d.latitude && d.longitude).length}
      </p>
      <SimpleMap devices={devices} />
    </div>
  );
}


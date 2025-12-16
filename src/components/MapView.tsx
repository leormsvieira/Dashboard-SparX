import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import { Device } from "@/hooks/useDevices";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Thermometer, MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
// GeoJSON is served from `public/parana.json` — fetch it at runtime to avoid
// bundling a very large JSON into the JS bundle.

// Fix para ícones do Leaflet não aparecerem
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Criar ícones customizados por status usando divIcon com CSS
const createCustomIcon = (status: "adequado" | "precario" | "critico", isPrototype: boolean = false) => {
  const colors = {
    adequado: "#16a34a", // Verde
    precario: "#eab308", // Amarelo
    critico: "#dc2626", // Vermelho
    prototype: "#ff6b35", // Laranja SparX
  };

  const color = isPrototype ? colors.prototype : colors[status];
  const size = isPrototype ? 36 : 30; // Maior se for protótipo
  const borderWidth = isPrototype ? 4 : 3;

  const iconHtml = `
    <div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: ${borderWidth}px solid white;
      box-shadow: 0 3px 8px rgba(0,0,0,0.5);
      ${isPrototype ? 'animation: pulse 2s ease-in-out infinite;' : ''}
    ">
      <div style="
        width: ${size * 0.35}px;
        height: ${size * 0.35}px;
        background-color: white;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
      "></div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: isPrototype ? "custom-marker-icon prototype-marker" : "custom-marker-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// Limites geográficos do estado do Paraná
// Expandidos para permitir visualização completa dos popups nas bordas
const PARANA_BOUNDS: L.LatLngBoundsExpression = [
  [-27.0, -55.0], // Sudoeste (expandido para permitir popups)
  [-22.2, -47.6], // Nordeste (expandido para permitir popups)
];

// Componente para ajustar o mapa ao Paraná
const SetViewToParana = () => {
  const map = useMap();

  useEffect(() => {
    // Coordenadas centrais do Paraná
    map.setView([-24.5, -51.5], 7);

    // Definir limites máximos do mapa (não permite sair do Paraná)
    map.setMaxBounds(PARANA_BOUNDS);

    // Zoom mínimo e máximo
    map.setMinZoom(7);
    map.setMaxZoom(18);
  }, [map]);

  return null;
};

interface MapViewProps {
  devices: Device[];
  selectedDeviceId?: string;
  onDeviceSelect?: (deviceId: string) => void;
}

export const MapView = ({ devices, selectedDeviceId, onDeviceSelect }: MapViewProps) => {
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  const [paranaGeoJSON, setParanaGeoJSON] = useState<any | null>(null);

  useEffect(() => {
    // Use Vite base URL to support serving from a subpath in production
    const baseUrl = (import.meta as any)?.env?.BASE_URL ?? '/';
    const url = `${baseUrl}parana.json`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} while loading ${url}`);
        return res.json();
      })
      .then((json) => {
        // Basic validation so we know why it might not render
        if (json && (json.type === 'FeatureCollection' || Array.isArray(json.features))) {
          console.log(`parana.json carregado (${json.features?.length ?? 'n/a'} features)`);
          setParanaGeoJSON(json);
        } else {
          console.error('parana.json carregado, mas formato inesperado', json);
          setParanaGeoJSON(null);
        }
      })
      .catch((err) => console.error('Erro ao carregar parana.json', err));
  }, []);

  // Filtrar apenas dispositivos com coordenadas válidas
  const devicesWithCoordinates = devices.filter(
    (device) => device.latitude && device.longitude
  );

  // Debug: Log para verificar dispositivos
  useEffect(() => {
    console.log("🗺️ MapView - Total de dispositivos:", devices.length);
    console.log("🗺️ MapView - Dispositivos com coordenadas:", devicesWithCoordinates.length);
    console.log("🗺️ MapView - Dispositivos:", devices);
    console.log("🗺️ MapView - Com coordenadas:", devicesWithCoordinates);
  }, [devices, devicesWithCoordinates]);

  const handleViewDetails = (deviceId: string) => {
    if (onDeviceSelect) {
      onDeviceSelect(deviceId);
    }
    // Navegar para a página de monitoramento com o dispositivo selecionado
    navigate(`/dashboard?device=${deviceId}`);
  };

  const getStatusColor = (status: "adequado" | "precario" | "critico") => {
    switch (status) {
      case "critico":
        return "bg-status-critico text-white";
      case "precario":
        return "bg-status-precario text-black";
      default:
        return "bg-status-adequado text-white";
    }
  };

  const getStatusLabel = (status: "adequado" | "precario" | "critico") => {
    switch (status) {
      case "critico":
        return "🔴 Crítico";
      case "precario":
        return "🟡 Precário";
      default:
        return "🟢 Adequado";
    }
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border-2 border-border shadow-lg" style={{ minHeight: '500px' }}>
      <MapContainer
        center={[-24.5, -51.5]}
        zoom={7}
        minZoom={7}
        maxZoom={18}
        maxBounds={PARANA_BOUNDS}
        maxBoundsViscosity={0.8}
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
        ref={mapRef}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <SetViewToParana />

        {/* Camada de mapa - Tema escuro */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* Destaque do estado do Paraná com GeoJSON (carregado em runtime de /parana.json) */}
        {paranaGeoJSON && (
          <GeoJSON
            data={paranaGeoJSON as any}
            style={{
              color: "#ff6b35",        // Laranja SparX para a borda
              weight: 2,               // Espessura da borda
              opacity: 0.6,            // Opacidade da borda
              fillColor: "#ff6b35",    // Laranja SparX para o preenchimento
              fillOpacity: 0.5,        // Opacidade de 50% conforme solicitado
            }}
          />
        )}

        {/* Marcadores dos dispositivos */}
        {devicesWithCoordinates.map((device) => {
          const isPrototype = device.serial_number === "esp32-transformador-prototype";

          return (
            <Marker
              key={device.id}
              position={[device.latitude!, device.longitude!]}
              icon={createCustomIcon(device.current_status, isPrototype)}
            >
            <Popup
              className="custom-popup"
              minWidth={280}
              maxWidth={300}
              autoPan={true}
              autoPanPadding={[50, 50]}
              keepInView={true}
            >
              <div className="p-2 space-y-3">
                {/* Header */}
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-black">{device.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{device.location}</span>
                  </div>
                  {isPrototype && (
                    <Badge className="bg-primary text-primary-foreground mt-1">
                      Dispositivo Protótipo
                    </Badge>
                  )}
                </div>

                {/* Status Badge */}
                <Badge className={cn("w-full justify-center py-1", isPrototype ? "bg-primary text-primary-foreground" : getStatusColor(device.current_status))}>
                  {isPrototype ? "🟠 Protótipo Funcional" : getStatusLabel(device.current_status)}
                </Badge>

                {/* Informações */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Serial:</span>
                    <span className="font-mono font-medium">{device.serial_number}</span>
                  </div>
                  
                  {device.last_reading_at && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">
                        Última leitura: {new Date(device.last_reading_at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Botão de ação */}
                <Button
                  onClick={() => handleViewDetails(device.id)}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="sm"
                >
                  <Thermometer className="w-4 h-4 mr-2" />
                  Ver Monitoramento
                </Button>
              </div>
            </Popup>
          </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};


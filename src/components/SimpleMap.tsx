import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Device } from "@/hooks/useDevices";

// Fix para ícones padrão do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface SimpleMapProps {
  devices: Device[];
}

export const SimpleMap = ({ devices }: SimpleMapProps) => {
  const devicesWithCoords = devices.filter(d => d.latitude && d.longitude);

  console.log("🗺️ SimpleMap - Devices with coords:", devicesWithCoords.length);

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <MapContainer
        center={[-24.5, -51.5]}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {devicesWithCoords.map((device) => (
          <Marker
            key={device.id}
            position={[device.latitude!, device.longitude!]}
          >
            <Popup>
              <div>
                <h3>{device.name}</h3>
                <p>{device.location}</p>
                <p>Status: {device.current_status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};


import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "../utils/leafletFix";
import "../utils/leafletIcon";

export default function MiniMap({ cameras }) {
  if (!cameras?.length) {
    return (
      <div className="h-44 flex items-center justify-center">
        No cameras available
      </div>
    );
  }

  const center = [
    cameras[0].latitude,
    cameras[0].longitude,
  ];

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={true}
      style={{
        height: "200px",
        width: "100%",
        borderRadius: "12px",
      }}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {cameras.map((camera) => (
        <Marker
          key={camera._id}
          position={[
            camera.latitude,
            camera.longitude,
          ]}
        >
          <Popup>
            <div>
              <h3 className="font-bold">
                {camera.name}
              </h3>

              <p>{camera.location}</p>

              <p>
                Capacity: {camera.capacity}
              </p>

              <p>
                Status: {camera.status}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
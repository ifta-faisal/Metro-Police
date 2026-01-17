// Reusable Map Component using Leaflet
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to update map view when center changes
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

export default function Map({ 
  center = [23.8103, 90.4125], // Default: Dhaka
  zoom = 12,
  markers = [],
  routes = [],
  onMapClick,
  children
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} zoom={zoom} />
      
      {/* Render markers */}
      {markers.map((marker, idx) => (
        <Marker key={idx} position={[marker.lat, marker.lng]}>
          {marker.popup && (
            <Popup>
              <div>
                <strong>{marker.popup.title}</strong>
                {marker.popup.content && <p>{marker.popup.content}</p>}
              </div>
            </Popup>
          )}
        </Marker>
      ))}
      
      {/* Render routes */}
      {routes.map((route, idx) => {
        if (route.waypoints && route.waypoints.length > 0) {
          return (
            <polyline
              key={idx}
              positions={route.waypoints.map(wp => [wp.lat, wp.lng])}
              color={route.color || 'blue'}
              weight={route.weight || 3}
              opacity={route.opacity || 0.7}
            />
          );
        }
        return null;
      })}
      
      {children}
    </MapContainer>
  );
}

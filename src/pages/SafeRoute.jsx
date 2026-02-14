// Safe Route GPS for Night Travel
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import 'leaflet/dist/leaflet.css';
import './SafeRoute.css';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

export default function SafeRoute() {
  const { isAuthenticated } = useAuth();
  const [startLocation, setStartLocation] = useState({ lat: '', lng: '' });
  const [endLocation, setEndLocation] = useState({ lat: '', lng: '' });
  const [routes, setRoutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [crimeData, setCrimeData] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCrimeData();
    }
  }, [isAuthenticated]);

  const fetchCrimeData = async () => {
    try {
      const res = await api.get('/maps/crime-data');
      const crimes = res.data.crimes || [];
      setCrimeData(crimes.map(c => ({
        lat: parseFloat(c.latitude),
        lng: parseFloat(c.longitude),
        severity: c.severity
      })));
    } catch (error) {
      console.error('Error fetching crime data:', error);
    }
  };

  const calculateRoutes = () => {
    if (!startLocation.lat || !startLocation.lng || !endLocation.lat || !endLocation.lng) {
      alert('Please enter both start and end locations');
      return;
    }

    setLoading(true);
    
    // Simulate route calculation
    setTimeout(() => {
      const start = [parseFloat(startLocation.lat), parseFloat(startLocation.lng)];
      const end = [parseFloat(endLocation.lat), parseFloat(endLocation.lng)];
      
      // Calculate shortest route (direct path)
      const shortestRoute = {
        name: 'Shortest Route',
        waypoints: [start, end],
        distance: calculateDistance(start, end),
        color: 'gray',
        weight: 3
      };
      
      // Calculate safer route (avoid high-risk zones)
      const saferRoute = calculateSaferRoute(start, end, crimeData);
      
      setRoutes({
        shortest: shortestRoute,
        safer: saferRoute
      });
      setLoading(false);
    }, 1000);
  };

  const calculateSaferRoute = (start, end, crimes) => {
    // Simple algorithm: add waypoints to avoid high-risk areas
    const midLat = (start[0] + end[0]) / 2;
    const midLng = (start[1] + end[1]) / 2;
    
    // Check for high-risk crimes near midpoint
    const highRiskNearby = crimes.filter(c => {
      const dist = calculateDistance([c.lat, c.lng], [midLat, midLng]);
      return dist < 0.01 && (c.severity === 'high' || c.severity === 'critical');
    });
    
    let waypoints = [start];
    
    if (highRiskNearby.length > 0) {
      // Adjust route to avoid high-risk area
      const avgRiskLat = highRiskNearby.reduce((sum, c) => sum + c.lat, 0) / highRiskNearby.length;
      const avgRiskLng = highRiskNearby.reduce((sum, c) => sum + c.lng, 0) / highRiskNearby.length;
      
      // Create waypoint away from risk
      const avoidLat = midLat + (midLat - avgRiskLat) * 0.5;
      const avoidLng = midLng + (midLng - avgRiskLng) * 0.5;
      
      waypoints.push([avoidLat, avoidLng]);
    } else {
      waypoints.push([midLat, midLng]);
    }
    
    waypoints.push(end);
    
    // Calculate total distance
    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      totalDistance += calculateDistance(waypoints[i], waypoints[i + 1]);
    }
    
    return {
      name: 'Safer Route',
      waypoints: waypoints,
      distance: totalDistance,
      color: 'green',
      weight: 4,
      safetyScore: calculateSafetyScore(waypoints, crimes)
    };
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2[0] - point1[0]) * Math.PI / 180;
    const dLng = (point2[1] - point1[1]) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateSafetyScore = (waypoints, crimes) => {
    let score = 100;
    waypoints.forEach(wp => {
      crimes.forEach(crime => {
        const dist = calculateDistance(wp, [crime.lat, crime.lng]);
        if (dist < 0.01) {
          const penalty = crime.severity === 'critical' ? 20 : crime.severity === 'high' ? 10 : 5;
          score -= penalty;
        }
      });
    });
    return Math.max(0, Math.min(100, score));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setStartLocation({
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString()
        });
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="safe-route">
        <h1>Safe Route GPS</h1>
        <p>Please login to use safe route planning</p>
      </div>
    );
  }

  const mapCenter = routes 
    ? [(parseFloat(startLocation.lat) + parseFloat(endLocation.lat)) / 2, 
       (parseFloat(startLocation.lng) + parseFloat(endLocation.lng)) / 2]
    : [23.8103, 90.4125];

  return (
    <div className="safe-route">
      <h1>Safe Route GPS for Night Travel</h1>
      
      <div className="route-form">
        <div className="form-row">
          <div className="form-group">
            <label>Start Location (Latitude)</label>
            <input
              type="number"
              step="0.0001"
              placeholder="23.8103"
              value={startLocation.lat}
              onChange={(e) => setStartLocation({ ...startLocation, lat: e.target.value })}
            />
            <button onClick={getCurrentLocation} className="btn-location">Use Current Location</button>
          </div>
          <div className="form-group">
            <label>Start Location (Longitude)</label>
            <input
              type="number"
              step="0.0001"
              placeholder="90.4125"
              value={startLocation.lng}
              onChange={(e) => setStartLocation({ ...startLocation, lng: e.target.value })}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Destination (Latitude)</label>
            <input
              type="number"
              step="0.0001"
              placeholder="23.7944"
              value={endLocation.lat}
              onChange={(e) => setEndLocation({ ...endLocation, lat: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Destination (Longitude)</label>
            <input
              type="number"
              step="0.0001"
              placeholder="90.4144"
              value={endLocation.lng}
              onChange={(e) => setEndLocation({ ...endLocation, lng: e.target.value })}
            />
          </div>
        </div>
        
        <button onClick={calculateRoutes} disabled={loading} className="btn-calculate">
          {loading ? 'Calculating...' : 'Calculate Routes'}
        </button>
      </div>

      {routes && (
        <div className="routes-comparison">
          <div className="route-info shortest">
            <h3>Shortest Route</h3>
            <p><strong>Distance:</strong> {routes.shortest.distance.toFixed(2)} km</p>
            <p><strong>Type:</strong> Direct path</p>
          </div>
          <div className="route-info safer">
            <h3>Safer Route</h3>
            <p><strong>Distance:</strong> {routes.safer.distance.toFixed(2)} km</p>
            <p><strong>Safety Score:</strong> {routes.safer.safetyScore}/100</p>
            <p><strong>Type:</strong> Avoids high-risk zones</p>
          </div>
        </div>
      )}

      <div className="map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={routes ? 13 : 12}
          style={{ height: '600px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={mapCenter} zoom={routes ? 13 : 12} />
          
          {startLocation.lat && startLocation.lng && (
            <Marker position={[parseFloat(startLocation.lat), parseFloat(startLocation.lng)]}>
              <Popup>Start Location</Popup>
            </Marker>
          )}
          
          {endLocation.lat && endLocation.lng && (
            <Marker position={[parseFloat(endLocation.lat), parseFloat(endLocation.lng)]}>
              <Popup>Destination</Popup>
            </Marker>
          )}
          
          {routes && (
            <>
              <Polyline
                positions={routes.shortest.waypoints}
                pathOptions={{ color: 'gray', weight: 3, opacity: 0.7 }}
              />
              <Polyline
                positions={routes.safer.waypoints}
                pathOptions={{ color: 'green', weight: 4, opacity: 0.8 }}
              />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

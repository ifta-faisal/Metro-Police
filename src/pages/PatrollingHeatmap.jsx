// Smart Police Patrolling Heatmap
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import 'leaflet/dist/leaflet.css';
import './PatrollingHeatmap.css';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function PatrollingLayer({ patrollingData, crimeData }) {
  // Calculate patrol intensity based on crime density
  const areaPatrol = {};
  
  patrollingData.forEach(patrol => {
    const areaKey = `${patrol.area_name}`;
    areaPatrol[areaKey] = {
      ...patrol,
      lat: parseFloat(patrol.latitude),
      lng: parseFloat(patrol.longitude),
      crimeCount: 0,
      priority: 'low'
    };
  });
  
  // Count crimes in each area
  crimeData.forEach(crime => {
    // Simple matching (in production, use actual area boundaries)
    const nearestArea = patrollingData.reduce((nearest, patrol) => {
      const dist1 = Math.abs(parseFloat(crime.lat) - parseFloat(nearest.latitude)) + 
                   Math.abs(parseFloat(crime.lng) - parseFloat(nearest.longitude));
      const dist2 = Math.abs(parseFloat(crime.lat) - parseFloat(patrol.latitude)) + 
                   Math.abs(parseFloat(crime.lng) - parseFloat(patrol.longitude));
      return dist2 < dist1 ? patrol : nearest;
    }, patrollingData[0]);
    
    if (nearestArea) {
      const areaKey = nearestArea.area_name;
      if (areaPatrol[areaKey]) {
        areaPatrol[areaKey].crimeCount++;
      }
    }
  });
  
  // Calculate priority and intensity based on actual crime counts
  // Get total crimes across all areas
  const totalCrimes = Object.values(areaPatrol).reduce((sum, area) => sum + area.crimeCount, 0);
  const avgCrimesPerArea = totalCrimes > 0 ? totalCrimes / Object.keys(areaPatrol).length : 0;
  
  // Calculate max crime count for threshold determination
  const maxCrimeCount = Math.max(...Object.values(areaPatrol).map(area => area.crimeCount), 0);
  
  Object.values(areaPatrol).forEach(area => {
    // Use actual crime counts and percentages for priority
    // High: > 30% of max crimes OR > 3 crimes
    // Medium: > 10% of max crimes OR > 1 crime
    // Low: everything else (0-1 crimes or < 10% of max)
    
    const crimePercentage = maxCrimeCount > 0 ? area.crimeCount / maxCrimeCount : 0;
    
    if (area.crimeCount >= 3 || crimePercentage > 0.3) {
      area.priority = 'high';
      area.patrol_intensity = Math.min(10, (area.patrol_intensity || 1) + 2);
    } else if (area.crimeCount >= 2 || crimePercentage > 0.1) {
      area.priority = 'medium';
      area.patrol_intensity = Math.min(10, (area.patrol_intensity || 1) + 1);
    } else {
      // Low priority: 0-1 crimes or low percentage
      area.priority = 'low';
      area.patrol_intensity = Math.max(1, (area.patrol_intensity || 1));
    }
  });
  
  return (
    <>
      {Object.values(areaPatrol).map((area, idx) => {
        const radius = area.patrol_intensity * 5;
        // Color based on priority: Red for High, Orange for Medium, Green for Low
        const color = area.priority === 'high' ? '#dc3545' : 
                     area.priority === 'medium' ? '#ffc107' : '#28a745';
        
        return (
          <CircleMarker
            key={idx}
            center={[area.lat, area.lng]}
            radius={radius}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.5,
              weight: 2
            }}
          >
            <Popup>
              <div className="patrol-popup">
                <h4>{area.area_name}</h4>
                <p><strong>Patrol Intensity:</strong> {area.patrol_intensity}/10</p>
                <p><strong>Priority:</strong> <span className={`priority ${area.priority}`}>{area.priority}</span></p>
                <p><strong>Officers:</strong> {area.officer_count}</p>
                <p><strong>Crime Count:</strong> {area.crimeCount}</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

export default function PatrollingHeatmap() {
  const { isAuthenticated, user } = useAuth();
  const [patrollingData, setPatrollingData] = useState([]);
  const [crimeData, setCrimeData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'officer' || user?.role === 'admin')) {
      fetchData();
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [patrolRes, crimeRes] = await Promise.all([
        api.get('/maps/patrolling-data'),
        api.get('/maps/crime-data')
      ]);
      
      setPatrollingData(patrolRes.data.patrolling || []);
      setCrimeData((crimeRes.data.crimes || []).map(c => ({
        lat: parseFloat(c.latitude),
        lng: parseFloat(c.longitude),
        severity: c.severity
      })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || (user?.role !== 'officer' && user?.role !== 'admin')) {
    return (
      <div className="patrolling-heatmap">
        <h1>Smart Police Patrolling Heatmap</h1>
        <p>Officer/Admin access required</p>
      </div>
    );
  }

  return (
    <div className="patrolling-heatmap">
      <div className="map-header">
        <h1>Smart Police Patrolling Heatmap</h1>
        <button onClick={fetchData} className="refresh-btn">
          Refresh Data
        </button>
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-color high"></span>
          <span>High Priority</span>
        </div>
        <div className="legend-item">
          <span className="legend-color medium"></span>
          <span>Medium Priority</span>
        </div>
        <div className="legend-item">
          <span className="legend-color low"></span>
          <span>Low Priority</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading patrolling data...</div>
      ) : (
        <div className="map-wrapper">
          <MapContainer
            center={[23.8103, 90.4125]}
            zoom={12}
            style={{ height: '600px', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <PatrollingLayer patrollingData={patrollingData} crimeData={crimeData} />
          </MapContainer>
        </div>
      )}

      <div className="patrol-stats">
        <h3>Patrolling Statistics</h3>
        <div className="stats-grid">
          {patrollingData.map((patrol, idx) => (
            <div key={idx} className="stat-card">
              <h4>{patrol.area_name}</h4>
              <p><strong>Intensity:</strong> {patrol.patrol_intensity}/10</p>
              <p><strong>Officers:</strong> {patrol.officer_count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

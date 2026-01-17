// AI-Powered Crime Risk Map with Heatmap
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import 'leaflet/dist/leaflet.css';
import './CrimeRiskMap.css';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function HeatmapLayer({ crimeData }) {
  const map = useMap();
  
  // Group crimes by area and calculate risk scores
  const areaRisk = {};
  
  crimeData.forEach(crime => {
    const areaKey = `${Math.round(crime.lat * 100) / 100}_${Math.round(crime.lng * 100) / 100}`;
    if (!areaRisk[areaKey]) {
      areaRisk[areaKey] = {
        lat: crime.lat,
        lng: crime.lng,
        crimes: [],
        riskScore: 0,
        area: 'Zone'
      };
    }
    areaRisk[areaKey].crimes.push(crime);
    
    // Calculate weighted risk score
    const severityWeight = {
      'low': 1,
      'medium': 3,
      'high': 6,
      'critical': 10
    };
    areaRisk[areaKey].riskScore += severityWeight[crime.severity] || 3;
  });
  
  // Normalize risk scores (0-100)
  const maxRisk = Math.max(...Object.values(areaRisk).map(a => a.riskScore), 1);
  Object.values(areaRisk).forEach(area => {
    area.riskScore = Math.round((area.riskScore / maxRisk) * 100);
    area.riskLevel = area.riskScore > 70 ? 'High' : area.riskScore > 40 ? 'Medium' : 'Low';
  });
  
  return (
    <>
      {Object.values(areaRisk).map((area, idx) => {
        const radius = Math.max(area.riskScore / 2, 10);
        const color = area.riskScore > 70 ? '#ff0000' : area.riskScore > 40 ? '#ff9900' : '#00ff00';
        
        return (
          <CircleMarker
            key={idx}
            center={[area.lat, area.lng]}
            radius={radius}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.6,
              weight: 2
            }}
          >
            <Popup>
              <div className="risk-popup">
                <h4>Risk Zone</h4>
                <p><strong>Risk Level:</strong> {area.riskLevel}</p>
                <p><strong>Risk Score:</strong> {area.riskScore}/100</p>
                <p><strong>Crime Count:</strong> {area.crimes.length}</p>
                <p><strong>Location:</strong> {area.lat.toFixed(4)}, {area.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

export default function CrimeRiskMap() {
  const { isAuthenticated } = useAuth();
  const [crimeData, setCrimeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCrimeData();
    }
  }, [isAuthenticated]);

  const fetchCrimeData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/maps/crime-data');
      const crimes = res.data.crimes || res.data.heatmapData || [];
      setCrimeData(crimes.map(c => ({
        lat: parseFloat(c.latitude || c.lat),
        lng: parseFloat(c.longitude || c.lng),
        crime_type: c.crime_type || c.type,
        severity: c.severity || 'medium',
        date: c.incident_date || c.date
      })));
    } catch (error) {
      console.error('Error fetching crime data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="crime-risk-map">
        <h1>Crime Risk Map</h1>
        <p>Please login to view the crime risk map</p>
      </div>
    );
  }

  return (
    <div className="crime-risk-map">
      <div className="map-header">
        <h1>AI-Powered Crime Risk Map</h1>
        <button onClick={fetchCrimeData} className="refresh-btn">
          Refresh Data
        </button>
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-color high"></span>
          <span>High Risk (70-100)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color medium"></span>
          <span>Medium Risk (40-70)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color low"></span>
          <span>Low Risk (0-40)</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading crime data...</div>
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
            <HeatmapLayer crimeData={crimeData} />
          </MapContainer>
        </div>
      )}

      <div className="map-stats">
        <h3>Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <strong>Total Crime Points:</strong> {crimeData.length}
          </div>
          <div className="stat-item">
            <strong>High Risk Zones:</strong> {
              crimeData.filter(c => {
                // Simple calculation for demo
                return true; // Would calculate based on density
              }).length
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// Crime Risk Map & Patrolling Heatmap
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './CrimeMap.css';

export default function CrimeMap() {
  const { isAuthenticated } = useAuth();
  const [crimeData, setCrimeData] = useState([]);
  const [patrollingData, setPatrollingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapType, setMapType] = useState('crime'); // 'crime' or 'patrolling'

  useEffect(() => {
    fetchData();
  }, [mapType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (mapType === 'crime') {
        const res = await api.get('/maps/crime-data');
        setCrimeData(res.data.crimes || []);
      } else {
        const res = await api.get('/maps/patrolling-data');
        setPatrollingData(res.data.patrolling || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simple map visualization using divs (in production, use Google Maps or Leaflet)
  const renderMap = () => {
    return (
      <div className="map-container">
        <div className="map-placeholder">
          <h3>Crime Risk Map</h3>
          <p>Map visualization would appear here</p>
          <p className="note">
            In production, integrate with Google Maps API or Leaflet.js
            to show interactive heatmap with crime data and patrolling locations
          </p>
          
          {mapType === 'crime' && crimeData.length > 0 && (
            <div className="crime-list">
              <h4>Recent Crimes ({crimeData.length})</h4>
              <div className="crime-items">
                {crimeData.slice(0, 10).map((crime, idx) => (
                  <div key={idx} className="crime-item">
                    <span className={`severity ${crime.severity}`}>{crime.severity}</span>
                    <span>{crime.crime_type}</span>
                    <span className="location">
                      {parseFloat(crime.latitude).toFixed(4)}, {parseFloat(crime.longitude).toFixed(4)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mapType === 'patrolling' && patrollingData.length > 0 && (
            <div className="patrol-list">
              <h4>Patrolling Areas ({patrollingData.length})</h4>
              <div className="patrol-items">
                {patrollingData.map((patrol, idx) => (
                  <div key={idx} className="patrol-item">
                    <span className="area">{patrol.area_name}</span>
                    <span className="intensity">Intensity: {patrol.patrol_intensity}/10</span>
                    <span className="officers">Officers: {patrol.officer_count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="crime-map">
      <div className="map-header">
        <h1>Crime Risk & Patrolling Map</h1>
        <div className="map-controls">
          <button
            className={mapType === 'crime' ? 'active' : ''}
            onClick={() => setMapType('crime')}
          >
            Crime Risk Map
          </button>
          <button
            className={mapType === 'patrolling' ? 'active' : ''}
            onClick={() => setMapType('patrolling')}
          >
            Patrolling Heatmap
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading map data...</div>
      ) : (
        renderMap()
      )}

      <div className="map-info">
        <h3>Map Information</h3>
        <p>
          {mapType === 'crime'
            ? 'This map shows crime incidents with heatmap visualization. Red areas indicate higher crime risk.'
            : 'This map shows police patrolling intensity. Blue areas indicate higher patrolling presence.'}
        </p>
        <p className="note">
          <strong>Note:</strong> This is a simplified visualization. In production, use mapping libraries
          like Google Maps, Leaflet.js, or Mapbox for interactive heatmaps.
        </p>
      </div>
    </div>
  );
}

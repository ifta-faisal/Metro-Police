// SOS Monitoring Page - Officer/Admin Dashboard
// Fetches SOS alerts in real-time style (polling every 10s)
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './SOSMonitoring.css';

export default function SOSMonitoring() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchSOSAlerts();
    
    // Start polling every 10 seconds
    if (isPolling) {
      intervalRef.current = setInterval(() => {
        fetchSOSAlerts();
      }, 10000); // 10 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPolling]);

  const fetchSOSAlerts = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get('/sos');
      setAlerts(res.data.alerts || []);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error fetching SOS alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setLoading(true);
    setMessage('');
    try {
      await api.put(`/sos/${id}/status`, { status });
      setMessage(`SOS alert status updated to ${status} successfully`);
      // Refresh the list
      fetchSOSAlerts();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error updating alert status');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'active') return 'badge-danger';
    if (status === 'responded') return 'badge-warning';
    if (status === 'resolved') return 'badge-success';
    return 'badge-secondary';
  };

  const togglePolling = () => {
    setIsPolling(!isPolling);
  };

  return (
    <div className="sos-monitoring-page">
      <div className="page-header">
        <h1>SOS Alert Monitoring</h1>
        <p>Real-time monitoring of emergency SOS alerts (Auto-refresh every 10 seconds)</p>
      </div>

      <div className="controls-section">
        <button 
          onClick={togglePolling} 
          className={`polling-btn ${isPolling ? 'active' : ''}`}
        >
          {isPolling ? '⏸️ Pause Auto-Refresh' : '▶️ Resume Auto-Refresh'}
        </button>
        <button onClick={fetchSOSAlerts} className="refresh-btn">Refresh Now</button>
        <span className="last-updated">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {loading && alerts.length === 0 ? (
        <div className="loading">Loading SOS alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="no-data">No active SOS alerts</div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <div key={alert.id} className={`alert-card ${alert.status === 'active' ? 'active-alert' : ''}`}>
              <div className="alert-header">
                <div>
                  <h3>🚨 SOS Alert #{alert.id}</h3>
                  <span className={`badge ${getStatusBadgeClass(alert.status)}`}>
                    {alert.status}
                  </span>
                  <span className="badge badge-type">
                    {alert.alert_type.replace('_', ' ')}
                  </span>
                </div>
                <button
                  className="view-details-btn"
                  onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
                >
                  {selectedAlert?.id === alert.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              <div className="alert-info">
                <p><strong>User:</strong> {alert.user_name || 'N/A'}</p>
                <p><strong>Contact:</strong> {alert.user_phone || alert.user_email || 'N/A'}</p>
                <p><strong>Time:</strong> {formatDate(alert.time || alert.created_at)}</p>
                <p><strong>Location:</strong> {alert.latitude && alert.longitude 
                  ? `${alert.latitude}, ${alert.longitude}` 
                  : 'N/A'}
                </p>
                {alert.station_name && (
                  <p><strong>Nearest Station:</strong> {alert.station_name}</p>
                )}
                {alert.station_contact && (
                  <p><strong>Station Contact:</strong> {alert.station_contact}</p>
                )}
              </div>

              {selectedAlert?.id === alert.id && (
                <div className="alert-details">
                  <h4>Message:</h4>
                  <p>{alert.message || 'No message provided'}</p>
                  {alert.latitude && alert.longitude && (
                    <div className="location-link">
                      <a 
                        href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📍 View Location on Map
                      </a>
                    </div>
                  )}
                  <p><strong>Created:</strong> {formatDate(alert.created_at)}</p>
                  {alert.responded_at && (
                    <p><strong>Responded:</strong> {formatDate(alert.responded_at)}</p>
                  )}
                  {alert.resolved_at && (
                    <p><strong>Resolved:</strong> {formatDate(alert.resolved_at)}</p>
                  )}
                </div>
              )}

              {alert.status === 'active' && (
                <div className="alert-actions">
                  <button
                    className="btn-respond"
                    onClick={() => handleStatusUpdate(alert.id, 'responded')}
                    disabled={loading}
                  >
                    Mark as Responded
                  </button>
                  <button
                    className="btn-resolve"
                    onClick={() => handleStatusUpdate(alert.id, 'resolved')}
                    disabled={loading}
                  >
                    Mark as Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

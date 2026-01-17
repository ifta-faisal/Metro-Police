// SOS Emergency Button
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './SOS.css';

export default function SOS() {
  const { isAuthenticated } = useAuth();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState(null);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          setMessage('Error getting location: ' + error.message);
        }
      );
    } else {
      setMessage('Geolocation is not supported by your browser');
    }
  };

  const sendSOS = async (alertType) => {
    if (!isAuthenticated) {
      setMessage('Please login to send SOS alert');
      return;
    }

    if (!location) {
      getLocation();
      setMessage('Please wait, getting your location...');
      setTimeout(() => sendSOS(alertType), 2000);
      return;
    }

    setSending(true);
    setMessage('');

    try {
      const res = await api.post('/sos/alert', {
        alert_type: alertType,
        latitude: location.latitude,
        longitude: location.longitude,
        message: `Emergency ${alertType} alert`
      });

      setMessage(`SOS Alert Sent! Nearest police station has been notified. Alert ID: ${res.data.alert.alertId}`);
      
      // Show alert notification
      if (res.data.alert.nearestStation) {
        setMessage(prev => prev + ` Nearest Station: ${res.data.alert.nearestStation.station_name}`);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error sending SOS alert');
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="sos-page">
        <h1>SOS Emergency</h1>
        <p>Please login to use SOS emergency feature</p>
      </div>
    );
  }

  return (
    <div className="sos-page">
      <h1>Emergency SOS</h1>
      <p className="subtitle">Press the button below in case of emergency</p>

      <div className="sos-buttons">
        <button
          className="sos-btn emergency"
          onClick={() => sendSOS('women_safety')}
          disabled={sending}
        >
          <span className="icon">🚨</span>
          <span className="text">Women Safety</span>
        </button>

        <button
          className="sos-btn emergency"
          onClick={() => sendSOS('child_safety')}
          disabled={sending}
        >
          <span className="icon">🚨</span>
          <span className="text">Child Safety</span>
        </button>

        <button
          className="sos-btn emergency"
          onClick={() => sendSOS('general_emergency')}
          disabled={sending}
        >
          <span className="icon">🚨</span>
          <span className="text">General Emergency</span>
        </button>
      </div>

      <button onClick={getLocation} className="location-btn">
        {location ? '📍 Location Ready' : 'Get My Location'}
      </button>

      {message && (
        <div className={`message ${sending ? 'sending' : ''}`}>
          {message}
        </div>
      )}

      <div className="emergency-info">
        <h3>Emergency Contacts</h3>
        <p><strong>Emergency:</strong> 999</p>
        <p><strong>Police Hotline:</strong> 01712345678</p>
        <p><strong>Women & Child Helpline:</strong> 10921</p>
      </div>
    </div>
  );
}

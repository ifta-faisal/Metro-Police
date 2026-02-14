// Crime Pattern Prediction with Charts
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './CrimePrediction.css';

export default function CrimePrediction() {
  const { isAuthenticated, user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'officer' || user?.role === 'admin')) {
      fetchPredictions();
    }
  }, [isAuthenticated, user]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/crime-prediction/predictions');
      setPredictions(res.data.predictions || []);
      
      // Get unique areas
      const areas = [...new Set(res.data.predictions?.map(p => p.area_name) || [])];
      if (areas.length > 0 && !selectedArea) {
        setSelectedArea(areas[0]);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAreaHistory = async (area) => {
    try {
      // Fetch historical crime data for the area
      const res = await api.get(`/maps/crime-data`);
      const crimes = res.data.crimes || res.data.heatmapData || [];
      
      // Filter by area and group by date
      const areaCrimes = crimes.filter(c => {
        // Simple area matching (in production, use actual area boundaries)
        return true; // For demo, use all crimes
      });
      
      // Group by date and count
      const dateGroups = {};
      areaCrimes.forEach(crime => {
        const date = new Date(crime.incident_date).toISOString().split('T')[0];
        dateGroups[date] = (dateGroups[date] || 0) + 1;
      });
      
      // Get last 30 days
      const last30Days = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last30Days.push({
          date: dateStr,
          actual: dateGroups[dateStr] || 0
        });
      }
      
      // Add predictions for next 7 days
      try {
        const predRes = await api.get('/crime-prediction/predictions');
        const predictions = predRes.data.predictions?.filter(p => p.area_name === area) || [];
        const next7Days = [];
        for (let i = 1; i <= 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          const prediction = predictions.find(p => {
            const predDate = new Date(p.prediction_date).toISOString().split('T')[0];
            return predDate === dateStr;
          });
          next7Days.push({
            date: dateStr,
            predicted: prediction ? Math.round(prediction.confidence_score / 10) : 0,
            actual: 0
          });
        }
        setChartData([...last30Days, ...next7Days]);
      } catch (error) {
        // If predictions not available, just show historical data
        setChartData(last30Days);
      }
    } catch (error) {
      console.error('Error fetching area history:', error);
    }
  };

  useEffect(() => {
    if (selectedArea) {
      fetchAreaHistory(selectedArea);
    }
  }, [selectedArea]);

  const generatePredictions = async () => {
    setLoading(true);
    try {
      const res = await api.post('/crime-prediction/generate');
      if (res.data.message || res.data.count) {
        fetchPredictions();
      }
    } catch (error) {
      console.error('Error generating predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || (user?.role !== 'officer' && user?.role !== 'admin')) {
    return (
      <div className="crime-prediction">
        <h1>Crime Pattern Prediction</h1>
        <p>Officer/Admin access required</p>
      </div>
    );
  }

  const areas = [...new Set(predictions.map(p => p.area_name))];

  return (
    <div className="crime-prediction">
      <div className="prediction-header">
        <h1>Crime Pattern Prediction</h1>
        <button onClick={generatePredictions} disabled={loading} className="btn-generate">
          {loading ? 'Generating...' : 'Generate Predictions'}
        </button>
      </div>

      <div className="area-selector">
        <label>Select Area:</label>
        <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
          <option value="">Select an area</option>
          {areas.map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </div>

      {selectedArea && chartData.length > 0 && (
        <div className="chart-container">
          <h2>Crime Trend: {selectedArea}</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#8884d8" 
                name="Actual Crimes"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#82ca9d" 
                name="Predicted Crimes"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="predictions-list">
        <h2>Area Predictions</h2>
        {predictions.length > 0 ? (
          <div className="predictions-grid">
            {predictions.map((pred, idx) => (
              <div key={idx} className={`prediction-card ${pred.risk_level}`}>
                <h3>{pred.area_name}</h3>
                <p><strong>Predicted Crime:</strong> {pred.predicted_crime_type}</p>
                <p><strong>Risk Level:</strong> <span className={`risk-badge ${pred.risk_level}`}>{pred.risk_level}</span></p>
                <p><strong>Confidence:</strong> {pred.confidence_score}%</p>
                <p><strong>Date:</strong> {new Date(pred.prediction_date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No predictions available. Click "Generate Predictions" to create predictions.</p>
        )}
      </div>
    </div>
  );
}

// Crime Prediction Analytics Page - Officer/Admin Dashboard
// Simple analytics: Group by area and month, calculate crime frequency trend, classify area risk
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './CrimePredictionAnalytics.css';

export default function CrimePredictionAnalytics() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get('/crime-prediction');
      setPredictions(res.data.predictions || []);
      setSummary(res.data.summary || null);
      if (!res.data.predictions || res.data.predictions.length === 0) {
        setMessage('No crime prediction data available. The system needs historical crime data to generate predictions.');
      }
    } catch (error) {
      console.error('Crime prediction fetch error:', error);
      setMessage(error.response?.data?.error || 'Error fetching crime predictions. Please ensure the crime_data table exists and has data.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    if (riskLevel === 'High') return '#dc3545';
    if (riskLevel === 'Medium') return '#ffc107';
    return '#28a745';
  };

  const getTrendIcon = (trend) => {
    if (parseFloat(trend) > 0) return '📈';
    if (parseFloat(trend) < 0) return '📉';
    return '➡️';
  };

  return (
    <div className="crime-prediction-analytics-page">
      <div className="page-header">
        <h1>Crime Prediction Analytics</h1>
        <p>Historical crime data analysis by area and month. Risk level classification based on crime frequency and trends.</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {summary && (
        <div className="summary-section">
          <h2>Summary</h2>
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Total Areas</h3>
              <p className="stat-number">{summary.totalAreas}</p>
            </div>
            <div className="summary-card high-risk">
              <h3>High Risk</h3>
              <p className="stat-number">{summary.highRiskAreas}</p>
            </div>
            <div className="summary-card medium-risk">
              <h3>Medium Risk</h3>
              <p className="stat-number">{summary.mediumRiskAreas}</p>
            </div>
            <div className="summary-card low-risk">
              <h3>Low Risk</h3>
              <p className="stat-number">{summary.lowRiskAreas}</p>
            </div>
          </div>
        </div>
      )}

      {loading && predictions.length === 0 ? (
        <div className="loading">Loading crime prediction analytics...</div>
      ) : predictions.length === 0 ? (
        <div className="no-data">No crime prediction data available</div>
      ) : (
        <div className="predictions-list">
          {predictions.map((prediction, index) => (
            <div key={index} className="prediction-card">
              <div className="prediction-header">
                <div>
                  <h3>{prediction.area || 'Unknown Area'}</h3>
                  <span 
                    className="risk-badge"
                    style={{ backgroundColor: getRiskColor(prediction.riskLevel) }}
                  >
                    {prediction.riskLevel} Risk
                  </span>
                  <span className="risk-score">
                    Risk Score: {prediction.riskScore}
                  </span>
                </div>
                <button
                  className="view-details-btn"
                  onClick={() => setSelectedArea(selectedArea === prediction.area ? null : prediction.area)}
                >
                  {selectedArea === prediction.area ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              <div className="prediction-info">
                <div className="stat-item">
                  <span className="stat-label">Total Crimes:</span>
                  <span className="stat-value">{prediction.totalCrimes}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Crime Frequency:</span>
                  <span className="stat-value">{prediction.crimeFrequency} /month</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Severity:</span>
                  <span className="stat-value">{prediction.avgSeverity.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Trend:</span>
                  <span className="stat-value trend">
                    {getTrendIcon(prediction.trend)} {prediction.trend}% 
                    <span className="trend-direction">({prediction.trendDirection})</span>
                  </span>
                </div>
              </div>

              {selectedArea === prediction.area && prediction.monthlyBreakdown && (
                <div className="prediction-details">
                  <h4>Monthly Breakdown (Last 6 Months):</h4>
                  <div className="monthly-breakdown">
                    {prediction.monthlyBreakdown.map((month, idx) => (
                      <div key={idx} className="month-item">
                        <span className="month-label">{month.month}</span>
                        <span className="month-crimes">{month.crimeCount} crimes</span>
                        {month.highSeverityCount > 0 && (
                          <span className="month-severity">⚠️ {month.highSeverityCount} high severity</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button onClick={fetchPredictions} className="refresh-btn">Refresh Data</button>
    </div>
  );
}

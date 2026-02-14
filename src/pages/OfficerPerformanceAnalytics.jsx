// Officer Performance Analytics - Admin Dashboard
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './OfficerPerformanceAnalytics.css';

export default function OfficerPerformanceAnalytics() {
  const { user } = useAuth();
  const [officers, setOfficers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    setLoading(true);
    setMessage('');
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('start_date', dateRange.startDate);
      if (dateRange.endDate) params.append('end_date', dateRange.endDate);
      
      const res = await api.get(`/admin/officer-performance?${params.toString()}`);
      setOfficers(res.data.officers || []);
      setSummary(res.data.summary || null);
    } catch (error) {
      console.error('Error fetching officer performance:', error);
      setMessage(error.response?.data?.error || 'Error fetching officer performance data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (hours) => {
    if (!hours || hours === 0) return 'N/A';
    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    if (hours < 24) return `${hours.toFixed(1)} hours`;
    return `${(hours / 24).toFixed(1)} days`;
  };

  const getPerformanceColor = (cases) => {
    if (cases >= 50) return '#28a745'; // Green - High performer
    if (cases >= 20) return '#ffc107'; // Yellow - Medium
    return '#6c757d'; // Gray - Low
  };

  return (
    <div className="officer-performance-page">
      <div className="page-header">
        <h1>Officer Performance Analytics</h1>
        <p>Monitor and analyze officer performance metrics</p>
      </div>

      {/* Date Filter */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Start Date:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>
        <div className="filter-group">
          <label>End Date:</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
        <button onClick={fetchPerformance} className="refresh-btn">Apply Filter</button>
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
              <h3>Total Officers</h3>
              <p className="stat-number">{summary.total_officers}</p>
            </div>
            <div className="summary-card">
              <h3>Total Cases</h3>
              <p className="stat-number">{summary.total_cases}</p>
            </div>
            <div className="summary-card">
              <h3>Total Approvals</h3>
              <p className="stat-number">{summary.total_approvals}</p>
            </div>
            <div className="summary-card">
              <h3>Total Rejections</h3>
              <p className="stat-number">{summary.total_rejections}</p>
            </div>
          </div>
        </div>
      )}

      {loading && officers.length === 0 ? (
        <div className="loading">Loading officer performance data...</div>
      ) : officers.length === 0 ? (
        <div className="no-data">No officer performance data available</div>
      ) : (
        <>
          {/* Performance Table */}
          <div className="performance-table-section">
            <h2>Officer Performance Details</h2>
            <table className="performance-table">
              <thead>
                <tr>
                  <th>Officer Name</th>
                  <th>Email</th>
                  <th>Total Cases</th>
                  <th>Approvals</th>
                  <th>Rejections</th>
                  <th>Avg Response Time</th>
                  <th>GD Cases</th>
                  <th>PCC Cases</th>
                  <th>Missing Cases</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((officer, idx) => (
                  <tr key={idx}>
                    <td>{officer.officer_name}</td>
                    <td>{officer.officer_email}</td>
                    <td className="cases-cell" style={{ color: getPerformanceColor(officer.total_cases_handled) }}>
                      {officer.total_cases_handled}
                    </td>
                    <td className="approval-cell">{officer.approvals_count}</td>
                    <td className="rejection-cell">{officer.rejections_count}</td>
                    <td>{formatTime(officer.avg_response_time)}</td>
                    <td>{officer.gd_cases}</td>
                    <td>{officer.pcc_cases}</td>
                    <td>{officer.missing_cases}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Performance Chart (Simple Bar Chart) */}
          <div className="chart-section">
            <h2>Performance Visualization</h2>
            <div className="chart-container">
              <h3>Total Cases Handled by Officer</h3>
              <div className="bar-chart">
                {officers.map((officer, idx) => {
                  const maxCases = Math.max(...officers.map(o => o.total_cases_handled), 1);
                  const percentage = (officer.total_cases_handled / maxCases) * 100;
                  return (
                    <div key={idx} className="bar-item">
                      <div className="bar-label">{officer.officer_name.split(' ')[0]}</div>
                      <div className="bar-wrapper">
                        <div
                          className="bar"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getPerformanceColor(officer.total_cases_handled)
                          }}
                        >
                          <span className="bar-value">{officer.total_cases_handled}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// City-Level Crime Trend Dashboard - Admin Dashboard
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './CrimeTrendsDashboard.css';

export default function CrimeTrendsDashboard() {
  const { user } = useAuth();
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchTrends();
  }, [selectedYear]);

  const fetchTrends = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get(`/admin/crime-trends?year=${selectedYear}`);
      setTrends(res.data);
    } catch (error) {
      console.error('Error fetching crime trends:', error);
      setMessage(error.response?.data?.error || 'Error fetching crime trends');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!trends || !trends.monthly_trends) {
      setMessage('No data available to export');
      return;
    }

    // Create CSV content
    let csv = 'Month,Crime Count,Growth Rate,Areas Affected\n';
    trends.monthly_trends.forEach(month => {
      csv += `${month.month},${month.crime_count},${month.growth_rate},${month.area_count}\n`;
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crime-trends-${selectedYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getGrowthColor = (rate) => {
    if (rate > 20) return '#dc3545'; // Red - High increase
    if (rate > 0) return '#ffc107'; // Yellow - Increase
    if (rate < -10) return '#28a745'; // Green - Significant decrease
    return '#6c757d'; // Gray - Stable
  };

  const maxCrimes = trends?.monthly_trends?.length > 0
    ? Math.max(...trends.monthly_trends.map(m => m.crime_count), 1)
    : 1;

  return (
    <div className="crime-trends-page">
      <div className="page-header">
        <h1>City-Level Crime Trend Dashboard</h1>
        <p>Comprehensive crime analytics and trend analysis</p>
      </div>

      {/* Year Filter */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>
        <button onClick={fetchTrends} className="refresh-btn">Refresh</button>
        {trends && trends.monthly_trends && trends.monthly_trends.length > 0 && (
          <button onClick={exportToCSV} className="export-btn">Export CSV</button>
        )}
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {loading && !trends ? (
        <div className="loading">Loading crime trends...</div>
      ) : !trends ? (
        <div className="no-data">No crime trend data available</div>
      ) : (
        <>
          {/* Summary Cards */}
          {trends.summary && (
            <div className="summary-section">
              <h2>Summary Statistics</h2>
              <div className="summary-cards">
                <div className="summary-card">
                  <h3>Total Crimes ({selectedYear})</h3>
                  <p className="stat-number">{trends.summary.total_crimes}</p>
                </div>
                <div className="summary-card">
                  <h3>Affected Areas</h3>
                  <p className="stat-number">{trends.summary.total_areas}</p>
                </div>
                <div className="summary-card">
                  <h3>Avg Crimes/Month</h3>
                  <p className="stat-number">{trends.summary.avg_crimes_per_month}</p>
                </div>
                <div className="summary-card">
                  <h3>Year-over-Year Change</h3>
                  <p className={`stat-number ${trends.year_comparison.yoy_change >= 0 ? 'negative' : 'positive'}`}>
                    {trends.year_comparison.yoy_change >= 0 ? '+' : ''}{trends.year_comparison.yoy_change}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Trend Line Chart */}
          {trends.monthly_trends && trends.monthly_trends.length > 0 && (
            <div className="chart-section">
              <h2>Monthly Crime Trends (Line Chart)</h2>
              <div className="line-chart-container">
                <div className="chart-wrapper">
                  {trends.monthly_trends.map((month, idx) => {
                    const height = (month.crime_count / maxCrimes) * 100;
                    return (
                      <div key={idx} className="chart-item">
                        <div className="chart-label">{month.month.split('-')[1]}</div>
                        <div className="chart-bar-wrapper">
                          <div
                            className="chart-bar"
                            style={{ height: `${height}%` }}
                            title={`${month.month}: ${month.crime_count} crimes`}
                          >
                            <span className="chart-value">{month.crime_count}</span>
                          </div>
                        </div>
                        <div className="chart-growth" style={{ color: getGrowthColor(month.growth_rate) }}>
                          {month.growth_rate > 0 ? '↑' : month.growth_rate < 0 ? '↓' : '→'} {Math.abs(month.growth_rate)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Area-wise Distribution Bar Chart */}
          {trends.area_distribution && trends.area_distribution.length > 0 && (
            <div className="chart-section">
              <h2>Area-wise Crime Distribution (Top 20)</h2>
              <div className="bar-chart-container">
                {trends.area_distribution.slice(0, 20).map((area, idx) => {
                  const maxAreaCrimes = Math.max(...trends.area_distribution.map(a => a.crime_count), 1);
                  const percentage = (area.crime_count / maxAreaCrimes) * 100;
                  return (
                    <div key={idx} className="bar-item">
                      <div className="bar-label">{area.area}</div>
                      <div className="bar-wrapper">
                        <div
                          className="bar"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: percentage > 70 ? '#dc3545' : percentage > 40 ? '#ffc107' : '#28a745'
                          }}
                        >
                          <span className="bar-value">{area.crime_count}</span>
                        </div>
                      </div>
                      <div className="bar-days">{area.days_with_crimes} days</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Crime Type Distribution */}
          {trends.crime_type_distribution && trends.crime_type_distribution.length > 0 && (
            <div className="chart-section">
              <h2>Crime Type Distribution</h2>
              <div className="type-distribution">
                {trends.crime_type_distribution.map((type, idx) => (
                  <div key={idx} className="type-item">
                    <div className="type-header">
                      <span className="type-name">{type.crime_type}</span>
                      <span className="type-count">{type.crime_count} crimes</span>
                    </div>
                    <div className="type-severity">
                      Avg Severity: {parseFloat(type.avg_severity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Most Affected Zones */}
          {trends.most_affected_zones && trends.most_affected_zones.length > 0 && (
            <div className="zones-section">
              <h2>Most Affected Zones</h2>
              <div className="zones-grid">
                {trends.most_affected_zones.map((zone, idx) => (
                  <div key={idx} className="zone-card">
                    <h4>{zone.area}</h4>
                    <p><strong>Crime Count:</strong> {zone.crime_count}</p>
                    <p><strong>Crime Rate:</strong> {zone.crime_rate}/day</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

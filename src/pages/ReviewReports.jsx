// Review Reports Page - Officer/Admin Dashboard
// Fetches all reports (GD, Missing Person, SOS) from DB
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './ReviewReports.css';

export default function ReviewReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({
    type: '', // 'gd', 'missing', 'sos', or '' for all
    status: '' // 'pending', 'under_investigation', 'resolved', etc.
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    setMessage('');
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      
      const res = await api.get(`/reports?${params.toString()}`);
      setReports(res.data.reports || []);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'pending') return 'badge-warning';
    if (status === 'resolved' || status === 'found') return 'badge-success';
    if (status === 'closed' || status === 'rejected') return 'badge-danger';
    if (status === 'under_investigation' || status === 'missing') return 'badge-info';
    return 'badge-secondary';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="review-reports-page">
      <div className="page-header">
        <h1>Review Reports</h1>
        <p>View and manage all reports: GD, Missing Person, and SOS alerts</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Report Type:</label>
          <select 
            value={filters.type} 
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="gd">GD Reports</option>
            <option value="missing">Missing Persons</option>
            <option value="sos">SOS Alerts</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_investigation">Under Investigation</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="missing">Missing</option>
            <option value="found">Found</option>
            <option value="active">Active</option>
          </select>
        </div>

        <button onClick={fetchReports} className="refresh-btn">Refresh</button>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="no-data">No reports found</div>
      ) : (
        <div className="reports-list">
          {reports.map((report) => (
            <div key={`${report.report_type}-${report.id}`} className="report-card">
              <div className="report-header">
                <div>
                  <h3>{report.report_number}</h3>
                  <span className={`badge badge-type badge-${report.report_type}`}>
                    {report.report_type.toUpperCase()}
                  </span>
                  <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                    {report.status.replace('_', ' ')}
                  </span>
                </div>
                <button 
                  className="view-details-btn"
                  onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                >
                  {selectedReport?.id === report.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              <div className="report-info">
                <p><strong>Type:</strong> {report.incident_type}</p>
                <p><strong>Location:</strong> {report.incident_location || 'N/A'}</p>
                <p><strong>Date:</strong> {formatDate(report.incident_date)}</p>
                <p><strong>Reporter:</strong> {report.reporter_name || 'N/A'}</p>
                <p><strong>Contact:</strong> {report.reporter_phone || report.reporter_email || 'N/A'}</p>
              </div>

              {selectedReport?.id === report.id && (
                <div className="report-details">
                  <h4>Full Description:</h4>
                  <p>{report.description || 'No description available'}</p>
                  <p><strong>Created:</strong> {formatDate(report.created_at)}</p>
                  <p><strong>Last Updated:</strong> {formatDate(report.updated_at)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

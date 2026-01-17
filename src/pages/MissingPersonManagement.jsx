// Missing Person Management Page - Officer/Admin Dashboard
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './MissingPersonManagement.css';

export default function MissingPersonManagement() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    setLoading(true);
    setMessage('');
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/missing-persons/all${params}`);
      setReports(res.data.reports || []);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error fetching missing person reports');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setLoading(true);
    setMessage('');
    try {
      // Map frontend status to backend status
      const statusMap = {
        'found': 'found',
        'closed': 'closed',
        'missing': 'missing'
      };
      const backendStatus = statusMap[status] || status;
      await api.put(`/missing/${id}/status`, { status: backendStatus });
      setMessage(`Missing person status updated to ${status} successfully`);
      // Refresh the list
      fetchReports();
    } catch (error) {
      console.error("Error updating missing person status:", error);
      setMessage(error.response?.data?.error || 'Error updating status');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'missing') return 'badge-warning';
    if (status === 'found') return 'badge-success';
    if (status === 'closed') return 'badge-secondary';
    return 'badge-info';
  };

  return (
    <div className="missing-person-management-page">
      <div className="page-header">
        <h1>Missing Person Management</h1>
        <p>Review and manage missing person reports</p>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <label>Filter by Status:</label>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="missing">Missing</option>
          <option value="found">Found</option>
          <option value="closed">Closed</option>
        </select>
        <button onClick={fetchReports} className="refresh-btn">Refresh</button>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {loading && reports.length === 0 ? (
        <div className="loading">Loading missing person reports...</div>
      ) : reports.length === 0 ? (
        <div className="no-data">No missing person reports found</div>
      ) : (
        <div className="reports-list">
          {reports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <div>
                  <h3>{report.person_name}</h3>
                  <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                    {report.status}
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
                <p><strong>Age:</strong> {report.person_age || 'N/A'}</p>
                <p><strong>Gender:</strong> {report.person_gender || 'N/A'}</p>
                <p><strong>Last Seen:</strong> {formatDate(report.last_seen_date)}</p>
                <p><strong>Location:</strong> {report.last_seen_location || 'N/A'}</p>
                <p><strong>Reporter:</strong> {report.reporter_name || 'N/A'}</p>
                <p><strong>Contact:</strong> {report.contact_number || report.reporter_email || 'N/A'}</p>
              </div>

              {selectedReport?.id === report.id && (
                <div className="report-details">
                  <h4>Physical Description:</h4>
                  <p>{report.physical_description || 'No description available'}</p>
                  {report.person_photo && (
                    <div className="photo-section">
                      <img src={`http://localhost:5000${report.person_photo}`} alt="Missing Person" />
                    </div>
                  )}
                  <p><strong>Reported:</strong> {formatDate(report.created_at)}</p>
                </div>
              )}

              {report.status === 'missing' && (
                <div className="report-actions">
                  <button
                    className="btn-approve"
                    onClick={() => handleStatusUpdate(report.id, 'found')}
                    disabled={loading}
                  >
                    Mark as Found
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleStatusUpdate(report.id, 'closed')}
                    disabled={loading}
                  >
                    Close Case
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

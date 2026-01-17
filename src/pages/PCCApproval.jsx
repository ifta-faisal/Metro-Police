// PCC Approval Page - Officer/Admin Dashboard
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './PCCApproval.css';

export default function PCCApproval() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    setMessage('');
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      console.log('Fetching PCC applications from:', `/pcc/all${params}`);
      const res = await api.get(`/pcc/all${params}`);
      console.log('PCC applications response:', res.data);
      setApplications(res.data.applications || []);
      if (res.data.applications && res.data.applications.length === 0) {
        setMessage('No PCC applications found.');
      }
    } catch (error) {
      console.error('Error fetching PCC applications:', error);
      console.error('Error response:', error.response);
      setMessage(error.response?.data?.error || error.message || 'Error fetching PCC applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, action) => {
    setLoading(true);
    setMessage('');
    try {
      await api.put(`/pcc/${id}/approve`, { action });
      setMessage(`PCC application ${action}d successfully`);
      // Refresh the list
      fetchApplications();
    } catch (error) {
      setMessage(error.response?.data?.error || `Error ${action === 'approve' ? 'approving' : 'rejecting'} application`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'pending') return 'badge-warning';
    if (status === 'under_review') return 'badge-info';
    if (status === 'approved') return 'badge-success';
    if (status === 'rejected') return 'badge-danger';
    return 'badge-secondary';
  };

  return (
    <div className="pcc-approval-page">
      <div className="page-header">
        <h1>PCC Application Approval</h1>
        <p>Review and approve/reject Police Clearance Certificate applications</p>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <label>Filter by Status:</label>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={fetchApplications} className="refresh-btn">Refresh</button>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {loading && applications.length === 0 ? (
        <div className="loading">Loading PCC applications...</div>
      ) : applications.length === 0 ? (
        <div className="no-data">No PCC applications found</div>
      ) : (
        <div className="applications-list">
          {applications.map((app) => (
            <div key={app.id} className="application-card">
              <div className="application-header">
                <div>
                  <h3>{app.application_number}</h3>
                  <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
                <button
                  className="view-details-btn"
                  onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                >
                  {selectedApp?.id === app.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              <div className="application-info">
                <p><strong>Applicant:</strong> {app.applicant_name || 'N/A'}</p>
                <p><strong>Email:</strong> {app.applicant_email || 'N/A'}</p>
                <p><strong>Purpose:</strong> {app.purpose}</p>
                <p><strong>NID:</strong> {app.nid_number}</p>
                <p><strong>Applied:</strong> {formatDate(app.created_at)}</p>
                {app.reviewed_by && (
                  <>
                    <p><strong>Reviewed by:</strong> {app.reviewer_name || 'N/A'}</p>
                    <p><strong>Reviewed at:</strong> {formatDate(app.reviewed_at)}</p>
                  </>
                )}
              </div>

              {selectedApp?.id === app.id && (
                <div className="application-details">
                  <h4>Address:</h4>
                  <p>{app.address}</p>
                </div>
              )}

              {(app.status === 'pending' || app.status === 'under_review') && (
                <div className="application-actions">
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(app.id, 'approve')}
                    disabled={loading}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleApprove(app.id, 'reject')}
                    disabled={loading}
                  >
                    Reject
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

// Policy & Alert Broadcasting - Admin Dashboard
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './AlertBroadcasting.css';

export default function AlertBroadcasting() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_area: '',
    role_target: 'all',
    priority: 'medium',
    expires_at: ''
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get('/admin/alerts/all');
      setAlerts(res.data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setMessage(error.response?.data?.error || 'Error fetching alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/admin/alerts', formData);
      setMessage('Alert created successfully');
      setShowForm(false);
      setFormData({
        title: '',
        message: '',
        target_area: '',
        role_target: 'all',
        priority: 'medium',
        expires_at: ''
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
      setMessage(error.response?.data?.error || 'Error creating alert');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleAlertStatus = async (alertId, currentStatus) => {
    setLoading(true);
    try {
      // You might want to add a PUT endpoint for this
      // For now, we'll just refresh
      setMessage('Status toggle functionality can be added');
      fetchAlerts();
    } catch (error) {
      console.error('Error toggling alert:', error);
      setMessage(error.response?.data?.error || 'Error updating alert');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'critical': return 'badge-danger';
      case 'high': return 'badge-warning';
      case 'medium': return 'badge-info';
      default: return 'badge-secondary';
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'badge-admin';
      case 'officer': return 'badge-officer';
      case 'citizen': return 'badge-citizen';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="alert-broadcasting-page">
      <div className="page-header">
        <h1>Policy & Alert Broadcasting</h1>
        <p>Create and manage system-wide alerts and notifications</p>
      </div>

      <div className="actions-header">
        <button onClick={() => setShowForm(!showForm)} className="create-alert-btn">
          {showForm ? 'Cancel' : '+ Create New Alert'}
        </button>
        <button onClick={fetchAlerts} className="refresh-btn">Refresh</button>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Create Alert Form */}
      {showForm && (
        <div className="alert-form-section">
          <h2>Create New Alert</h2>
          <form onSubmit={handleSubmit} className="alert-form">
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Alert title"
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows="4"
                placeholder="Alert message content"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Target Role</label>
                <select
                  name="role_target"
                  value={formData.role_target}
                  onChange={handleInputChange}
                >
                  <option value="all">All Users</option>
                  <option value="citizen">Citizens Only</option>
                  <option value="officer">Officers Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>
              <div className="form-group">
                <label>Target Area (Optional)</label>
                <input
                  type="text"
                  name="target_area"
                  value={formData.target_area}
                  onChange={handleInputChange}
                  placeholder="e.g., Gulshan, Dhanmondi"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Expires At (Optional)</label>
              <input
                type="datetime-local"
                name="expires_at"
                value={formData.expires_at}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                Create Alert
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts List */}
      {loading && alerts.length === 0 && !showForm ? (
        <div className="loading">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="no-data">No alerts found</div>
      ) : (
        <div className="alerts-list-section">
          <h2>All Alerts ({alerts.length})</h2>
          <div className="alerts-list">
            {alerts.map((alert) => (
              <div key={alert.id} className={`alert-card ${!alert.is_active ? 'inactive' : ''}`}>
                <div className="alert-header">
                  <div>
                    <h3>{alert.title}</h3>
                    <div className="alert-badges">
                      <span className={`badge ${getPriorityBadgeClass(alert.priority)}`}>
                        {alert.priority}
                      </span>
                      <span className={`badge ${getRoleBadgeClass(alert.role_target)}`}>
                        {alert.role_target}
                      </span>
                      {alert.is_active ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-secondary">Inactive</span>
                      )}
                    </div>
                  </div>
                  <span className="alert-date">{formatDate(alert.created_at)}</span>
                </div>
                <div className="alert-body">
                  <p>{alert.message}</p>
                  {alert.target_area && (
                    <p className="alert-area"><strong>Target Area:</strong> {alert.target_area}</p>
                  )}
                  {alert.expires_at && (
                    <p className="alert-expiry"><strong>Expires:</strong> {formatDate(alert.expires_at)}</p>
                  )}
                  <p className="alert-creator"><strong>Created by:</strong> {alert.created_by_name || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

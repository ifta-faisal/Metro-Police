// Crime/Incident Reporting (GD)
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './CrimeReports.css';

export default function CrimeReports() {
  const { isAuthenticated } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    report_type: '',
    incident_date: '',
    incident_location: '',
    description: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchReports();
    }
  }, [isAuthenticated]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/crime-reports/my-reports');
      setReports(res.data.reports || []);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await api.post('/crime-reports/submit', formData);
      setMessage(`Report submitted successfully! GD Number: ${res.data.gdNumber}`);
      setShowForm(false);
      setFormData({
        report_type: '',
        incident_date: '',
        incident_location: '',
        description: ''
      });
      fetchReports();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="crime-reports">
        <h1>Crime/Incident Reporting</h1>
        <p>Please login to file a report</p>
      </div>
    );
  }

  return (
    <div className="crime-reports">
      <div className="header-section">
        <h1>Crime/Incident Reporting (GD)</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'File New Report'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="report-form">
          <h2>File General Diary (GD)</h2>
          
          <div className="form-group">
            <label>Report Type *</label>
            <select
              value={formData.report_type}
              onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
              required
            >
              <option value="">Select type</option>
              <option value="theft">Theft</option>
              <option value="assault">Assault</option>
              <option value="fraud">Fraud</option>
              <option value="vandalism">Vandalism</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Incident Date & Time *</label>
            <input
              type="datetime-local"
              value={formData.incident_date}
              onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Incident Location *</label>
            <input
              type="text"
              placeholder="Enter location"
              value={formData.incident_location}
              onChange={(e) => setFormData({ ...formData, incident_location: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              rows="5"
              placeholder="Describe the incident in detail"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {message && <div className="message">{message}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      )}

      <div className="reports-section">
        <h2>My Reports</h2>
        {loading && !showForm ? (
          <p>Loading...</p>
        ) : reports.length > 0 ? (
          <div className="reports-list">
            {reports.map((report) => (
              <div key={report.id} className="report-card">
                <div className="report-header">
                  <h3>GD Number: {report.gd_number}</h3>
                  <span className={`status ${report.status}`}>{report.status}</span>
                </div>
                <div className="report-details">
                  <p><strong>Type:</strong> {report.report_type}</p>
                  <p><strong>Date:</strong> {new Date(report.incident_date).toLocaleString()}</p>
                  <p><strong>Location:</strong> {report.incident_location}</p>
                  <p><strong>Description:</strong> {report.description}</p>
                  <p><strong>Submitted:</strong> {new Date(report.created_at).toLocaleString()}</p>
                  {report.update_count > 0 && (
                    <p><strong>Updates:</strong> {report.update_count}</p>
                  )}
                </div>
                <a href={`/crime-reports/${report.gd_number}`} className="view-details">
                  View Details & Updates
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p>No reports found</p>
        )}
      </div>
    </div>
  );
}

// Lost Item Report Page
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './LostItems.css';

export default function LostItems() {
  const { isAuthenticated, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    item_type: '',
    item_description: '',
    lost_date: '',
    lost_location: '',
    contact_number: ''
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
      const res = await api.get('/lost-items/my-reports');
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
      const res = await api.post('/lost-items/report', formData);
      setMessage('Lost item reported successfully!');
      setShowForm(false);
      setFormData({
        item_type: '',
        item_description: '',
        lost_date: '',
        lost_location: '',
        contact_number: ''
      });
      fetchReports();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async (reportId) => {
    try {
      const res = await api.get(`/lost-items/${reportId}/certificate`);
      setMessage('Certificate generated! Check your downloads.');
      // In production, this would download a PDF
      console.log('Certificate data:', res.data);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error generating certificate');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="lost-items">
        <h1>Lost Item Report</h1>
        <p>Please login to report a lost item</p>
      </div>
    );
  }

  return (
    <div className="lost-items">
      <div className="header-section">
        <h1>Lost Item Report</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Report Lost Item'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="report-form">
          <h2>Report Lost Item</h2>
          
          <div className="form-group">
            <label>Item Type *</label>
            <input
              type="text"
              placeholder="e.g., Mobile Phone, Wallet, Keys"
              value={formData.item_type}
              onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              rows="4"
              placeholder="Describe the item in detail"
              value={formData.item_description}
              onChange={(e) => setFormData({ ...formData, item_description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Lost Date *</label>
            <input
              type="datetime-local"
              value={formData.lost_date}
              onChange={(e) => setFormData({ ...formData, lost_date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Lost Location *</label>
            <input
              type="text"
              placeholder="Where did you lose it?"
              value={formData.lost_location}
              onChange={(e) => setFormData({ ...formData, lost_location: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Contact Number</label>
            <input
              type="tel"
              placeholder="Your contact number"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
            />
          </div>

          {message && <div className="message">{message}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      )}

      <div className="reports-section">
        <h2>My Lost Item Reports</h2>
        {loading ? (
          <p>Loading...</p>
        ) : reports.length > 0 ? (
          <div className="reports-list">
            {reports.map((report) => (
              <div key={report.id} className="report-card">
                <div className="report-header">
                  <h3>{report.item_type}</h3>
                  <span className={`status ${report.status}`}>{report.status}</span>
                </div>
                <div className="report-details">
                  <p><strong>Description:</strong> {report.item_description}</p>
                  <p><strong>Lost Date:</strong> {new Date(report.lost_date).toLocaleString()}</p>
                  <p><strong>Location:</strong> {report.lost_location}</p>
                  {report.contact_number && <p><strong>Contact:</strong> {report.contact_number}</p>}
                </div>
                {report.status === 'reported' && (
                  <button onClick={() => generateCertificate(report.id)} className="btn-certificate">
                    Generate Certificate
                  </button>
                )}
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

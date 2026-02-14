// Police Clearance Certificate Page
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './PCC.css';

export default function PCC() {
  const { isAuthenticated, user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    purpose: '',
    nid_number: '',
    address: '',
    passport: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications();
    }
  }, [isAuthenticated]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pcc/my-applications');
      setApplications(res.data.applications || []);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error fetching applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await api.post('/pcc/apply', formData);
      setMessage(`Application submitted successfully! Application Number: ${res.data.applicationNumber}`);
      setShowForm(false);
      setFormData({
        purpose: '',
        nid_number: '',
        address: '',
        passport: ''
      });
      fetchApplications();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error submitting application');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (applicationId) => {
    try {
      const res = await api.get(`/pcc/${applicationId}/certificate`);
      setMessage('Certificate ready for download!');
      // In production, this would download a PDF
      console.log('Certificate data:', res.data);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error downloading certificate');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="pcc">
        <h1>Police Clearance Certificate</h1>
        <p>Please login to apply for PCC</p>
      </div>
    );
  }

  return (
    <div className="pcc">
      <div className="header-section">
        <h1>Police Clearance Certificate (PCC)</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Apply for PCC'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="application-form">
          <h2>PCC Application</h2>
          
          <div className="form-group">
            <label>Purpose *</label>
            <select
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              required
            >
              <option value="">Select purpose</option>
              <option value="Job Application">Job Application</option>
              <option value="Visa Application">Visa Application</option>
              <option value="University Admission">University Admission</option>
              <option value="Business License">Business License</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>NID Number *</label>
            <input
              type="text"
              placeholder="Enter your NID number"
              value={formData.nid_number}
              onChange={(e) => setFormData({ ...formData, nid_number: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Address *</label>
            <textarea
              rows="3"
              placeholder="Your current address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Passport Number (Optional)</label>
            <input
              type="text"
              placeholder="If applicable"
              value={formData.passport}
              onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
            />
          </div>

          {message && <div className="message">{message}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      )}

      <div className="applications-section">
        <h2>My PCC Applications</h2>
        {loading ? (
          <p>Loading...</p>
        ) : applications.length > 0 ? (
          <div className="applications-list">
            {applications.map((app) => (
              <div key={app.id} className="application-card">
                <div className="application-header">
                  <h3>Application #{app.application_number}</h3>
                  <span className={`status ${app.status}`}>{app.status}</span>
                </div>
                <div className="application-details">
                  <p><strong>Purpose:</strong> {app.purpose}</p>
                  <p><strong>NID:</strong> {app.nid_number}</p>
                  <p><strong>Address:</strong> {app.address}</p>
                  <p><strong>Submitted:</strong> {new Date(app.created_at).toLocaleString()}</p>
                  {app.reviewed_at && (
                    <p><strong>Reviewed:</strong> {new Date(app.reviewed_at).toLocaleString()}</p>
                  )}
                </div>
                {app.status === 'approved' && (
                  <button onClick={() => downloadCertificate(app.id)} className="btn-download">
                    Download Certificate
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No applications found</p>
        )}
      </div>
    </div>
  );
}

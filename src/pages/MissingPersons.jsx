// Missing Person Report Page
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './MissingPersons.css';

export default function MissingPersons() {
  const { isAuthenticated, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    person_name: '',
    person_age: '',
    person_gender: '',
    last_seen_date: '',
    last_seen_location: '',
    physical_description: '',
    contact_number: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchReports();
    }
  }, [isAuthenticated]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/missing-persons/my-reports');
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

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    if (selectedFile) {
      formDataToSend.append('person_photo', selectedFile);
    }

    try {
      const res = await api.post('/missing-persons/report', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Missing person reported successfully!');
      setShowForm(false);
      setFormData({
        person_name: '',
        person_age: '',
        person_gender: '',
        last_seen_date: '',
        last_seen_location: '',
        physical_description: '',
        contact_number: ''
      });
      setSelectedFile(null);
      fetchReports();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="missing-persons">
        <h1>Missing Person Report</h1>
        <p>Please login to report a missing person</p>
      </div>
    );
  }

  return (
    <div className="missing-persons">
      <div className="header-section">
        <h1>Missing Person Report</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Report Missing Person'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="report-form" encType="multipart/form-data">
          <h2>Report Missing Person</h2>
          
          <div className="form-group">
            <label>Person Name *</label>
            <input
              type="text"
              placeholder="Full name"
              value={formData.person_name}
              onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                placeholder="Age"
                value={formData.person_age}
                onChange={(e) => setFormData({ ...formData, person_age: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                value={formData.person_gender}
                onChange={(e) => setFormData({ ...formData, person_gender: e.target.value })}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Last Seen Date *</label>
            <input
              type="datetime-local"
              value={formData.last_seen_date}
              onChange={(e) => setFormData({ ...formData, last_seen_date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Last Seen Location *</label>
            <input
              type="text"
              placeholder="Where was the person last seen?"
              value={formData.last_seen_location}
              onChange={(e) => setFormData({ ...formData, last_seen_location: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Physical Description</label>
            <textarea
              rows="4"
              placeholder="Height, build, clothing, distinguishing features"
              value={formData.physical_description}
              onChange={(e) => setFormData({ ...formData, physical_description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Contact Number</label>
            <input
              type="tel"
              placeholder="Contact number"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Person Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            {selectedFile && <p className="file-name">Selected: {selectedFile.name}</p>}
          </div>

          {message && <div className="message">{message}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      )}

      <div className="reports-section">
        <h2>Missing Person Reports</h2>
        {loading ? (
          <p>Loading...</p>
        ) : reports.length > 0 ? (
          <div className="reports-list">
            {reports.map((report) => (
              <div key={report.id} className="report-card">
                {report.person_photo && (
                  <img 
                    src={`http://localhost:5000${report.person_photo}`} 
                    alt={report.person_name}
                    className="person-photo"
                  />
                )}
                <div className="report-content">
                  <div className="report-header">
                    <h3>{report.person_name}</h3>
                    <span className={`status ${report.status}`}>{report.status}</span>
                  </div>
                  <div className="report-details">
                    {report.person_age && <p><strong>Age:</strong> {report.person_age}</p>}
                    {report.person_gender && <p><strong>Gender:</strong> {report.person_gender}</p>}
                    <p><strong>Last Seen:</strong> {new Date(report.last_seen_date).toLocaleString()}</p>
                    <p><strong>Location:</strong> {report.last_seen_location}</p>
                    {report.physical_description && (
                      <p><strong>Description:</strong> {report.physical_description}</p>
                    )}
                    {report.matched_person_name && (
                      <p className="match-alert">⚠️ Potential match: {report.matched_person_name}</p>
                    )}
                  </div>
                </div>
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

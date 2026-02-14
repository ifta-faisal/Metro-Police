// GD Management Page - Officer/Admin Dashboard
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import "./GDPage.css";

export default function GDPage() {
  const { user } = useAuth();
  const [gds, setGds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedGD, setSelectedGD] = useState(null);

  useEffect(() => {
    fetchGD();
  }, []);

  const fetchGD = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await api.get("/crime-reports/gd");
      setGds(res.data.gds || []);
    } catch (error) {
      setMessage(error.response?.data?.error || "Error fetching GD applications");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setLoading(true);
    setMessage("");
    try {
      // Map frontend status to backend status
      const statusMap = {
        'approved': 'approved',
        'rejected': 'rejected',
        'investigating': 'investigating',
        'pending': 'pending'
      };
      const backendStatus = statusMap[status] || status;
      await api.put(`/gd/${id}/status`, { status: backendStatus });
      setMessage(`GD status updated to ${status} successfully`);
      // Refresh the list
      fetchGD();
    } catch (error) {
      console.error("Error updating GD status:", error);
      setMessage(error.response?.data?.error || "Error updating GD status");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="gd-management-page">
      <div className="page-header">
        <h1>GD Management</h1>
        <p>Review and manage General Diary applications</p>
      </div>

      {message && (
        <div className={`message ${message.includes("Error") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {loading && gds.length === 0 ? (
        <div className="loading">Loading GD applications...</div>
      ) : gds.length === 0 ? (
        <div className="no-data">No pending GD applications</div>
      ) : (
        <div className="gd-list">
          {gds.map((gd) => (
            <div key={gd.id} className="gd-card">
              <div className="gd-header">
                <div>
                  <h3>{gd.gd_number}</h3>
                  <span className={`badge badge-${gd.status}`}>
                    {gd.status.replace("_", " ")}
                  </span>
                </div>
                <button
                  className="view-details-btn"
                  onClick={() => setSelectedGD(selectedGD?.id === gd.id ? null : gd)}
                >
                  {selectedGD?.id === gd.id ? "Hide Details" : "View Details"}
                </button>
              </div>

              <div className="gd-info">
                <p><strong>Type:</strong> {gd.report_type}</p>
                <p><strong>Location:</strong> {gd.incident_location}</p>
                <p><strong>Date:</strong> {formatDate(gd.incident_date)}</p>
                <p><strong>Reporter:</strong> {gd.reporter_name || "N/A"}</p>
                <p><strong>Contact:</strong> {gd.reporter_email || "N/A"}</p>
              </div>

              {selectedGD?.id === gd.id && (
                <div className="gd-details">
                  <h4>Description:</h4>
                  <p>{gd.description}</p>
                  <p><strong>Created:</strong> {formatDate(gd.created_at)}</p>
                </div>
              )}

              <div className="gd-actions">
                <button
                  className="btn-approve"
                  onClick={() => handleStatusUpdate(gd.id, "approved")}
                  disabled={loading}
                >
                  Approve
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleStatusUpdate(gd.id, "rejected")}
                  disabled={loading}
                >
                  Reject
                </button>
                <button
                  className="btn-investigating"
                  onClick={() => handleStatusUpdate(gd.id, "investigating")}
                  disabled={loading}
                >
                  Under Investigation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

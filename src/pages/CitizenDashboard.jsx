// Citizen Dashboard
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    fines: 0,
    reports: 0,
    applications: 0,
    alerts: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [finesRes, reportsRes, pccRes, sosRes] = await Promise.all([
        api.get('/traffic-fines/my-fines'),
        api.get('/crime-reports/my-reports'),
        api.get('/pcc/my-applications'),
        api.get('/sos/my-alerts')
      ]);

      setStats({
        fines: finesRes.data.fines?.length || 0,
        reports: reportsRes.data.reports?.length || 0,
        applications: pccRes.data.applications?.length || 0,
        alerts: sosRes.data.alerts?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}</h1>
        <p>Citizen Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Traffic Fines</h3>
          <p className="stat-number">{stats.fines}</p>
          <Link to="/traffic-fines">View Details</Link>
        </div>

        <div className="stat-card">
          <h3>Crime Reports</h3>
          <p className="stat-number">{stats.reports}</p>
          <Link to="/crime-reports">View Details</Link>
        </div>

        <div className="stat-card">
          <h3>PCC Applications</h3>
          <p className="stat-number">{stats.applications}</p>
          <Link to="/pcc">View Details</Link>
        </div>

        <div className="stat-card">
          <h3>SOS Alerts</h3>
          <p className="stat-number">{stats.alerts}</p>
          <Link to="/sos">View Details</Link>
        </div>
<div className="stat-card">
    <h3>Report Lost Items</h3>
    <p className="stat-number">{stats.alerts}</p>
    <Link to="/lost-items/report">View Details</Link>  
  </div>

  <div className="stat-card">
    <h3>Missing Person</h3>
    <p className="stat-number">{stats.alerts}</p>
    <Link to="/missing-persons/report">View Details</Link> 
  </div>

      </div>

      

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">

          <Link to="/traffic-fines" className="action-card">
            <h3>Check Traffic Fine</h3>
            <p>Check and pay your traffic fines</p>
          </Link>

          <Link to="/crime-reports/submit" className="action-card">
            <h3>File GD Report</h3>
            <p>Report a crime or incident</p>
          </Link>

          <Link to="/lost-items/report" className="action-card">
            <h3>Report Lost Item</h3>
            <p>Report a lost item</p>
          </Link>

          <Link to="/missing-persons/report" className="action-card">
            <h3>Missing Person</h3>
            <p>Report a missing person</p>
          </Link>

          <Link to="/pcc/apply" className="action-card">
            <h3>Apply for PCC</h3>
            <p>Police Clearance Certificate</p>
          </Link>

          <Link to="/sos" className="action-card emergency">
            <h3>SOS Emergency</h3>
            <p>Emergency assistance</p>
          </Link>

          <Link to="/citizen/crime-risk-map" className="action-card">
            <h3>Crime Risk Map</h3>
            <p>View crime risk heatmap</p>
          </Link>

          <Link to="/citizen/safe-route" className="action-card">
            <h3>Safe Route GPS</h3>
            <p>Plan safe routes for night travel</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

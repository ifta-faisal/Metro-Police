// Admin Dashboard
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    activeSOS: 0,
    totalFines: 0,
    totalCriminals: 0,
    pendingPCC: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [reportsRes, sosRes, finesRes, criminalsRes, pccRes] = await Promise.all([
        api.get('/crime-reports/all'),
        api.get('/sos/active'),
        api.get('/traffic-fines/all'),
        api.get('/criminals/all'),
        api.get('/pcc/all?status=pending')
      ]);

      const reports = reportsRes.data.reports || [];
      setStats({
        totalReports: reports.length,
        pendingReports: reports.filter(r => r.status === 'pending').length,
        activeSOS: sosRes.data.alerts?.length || 0,
        totalFines: finesRes.data.fines?.length || 0,
        totalCriminals: criminalsRes.data.criminals?.length || 0,
        pendingPCC: pccRes.data.applications?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.name}</p>
      </div>

      

      <div className="quick-actions">
        <h2>Management Tools</h2>
        <div className="actions-grid">
          {/* <a href="/admin/reports" className="action-card">
            <h3>Crime Reports</h3>
            <p>Manage all crime reports</p>
          </a>
          <a href="/admin/criminals" className="action-card">
            <h3>Criminal Database</h3>
            <p>Manage criminal records</p>
          </a>
          <a href="/admin/maps" className="action-card">
            <h3>Crime Risk Map</h3>
            <p>View and manage crime data</p>
          </a>
          <a href="/admin/predictions" className="action-card">
            <h3>Crime Predictions</h3>
            <p>Generate and view predictions</p>
          </a>
          <a href="/admin/patrolling" className="action-card">
            <h3>Patrolling Data</h3>
            <p>Manage patrolling information</p>
          </a>
          <a href="/admin/sos" className="action-card emergency">
            <h3>SOS Alerts</h3>
            <p>Monitor emergency alerts</p>
          </a> */}
          <a href="/admin/officer-performance" className="action-card">
            <h3>Officer Performance</h3>
            <p>Analytics and performance metrics</p>
          </a>
          <a href="/admin/audit-logs" className="action-card">
            <h3>Audit Logs</h3>
            <p>System activity and audit trail</p>
          </a>
          <a href="/admin/crime-trends" className="action-card">
            <h3>Crime Trends</h3>
            <p>City-level crime analytics</p>
          </a>
          <a href="/admin/alerts" className="action-card">
            <h3>Alert Broadcasting</h3>
            <p>Create and manage system alerts</p>
          </a>
          <a href="/admin/config" className="action-card">
            <h3>System Configuration</h3>
            <p>Manage system settings</p>
          </a>
        </div>
      </div>
    </div>
  );
}

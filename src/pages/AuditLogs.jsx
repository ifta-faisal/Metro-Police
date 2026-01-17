// System Audit Logs - Admin Dashboard
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './AuditLogs.css';

export default function AuditLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({
    date: '',
    user: '',
    action: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    setMessage('');
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      if (filters.date) params.append('date', filters.date);
      if (filters.user) params.append('user', filters.user);
      if (filters.action) params.append('action', filters.action);
      
      const res = await api.get(`/admin/audit-logs?${params.toString()}`);
      setLogs(res.data.logs || []);
      setPagination(prev => ({ ...prev, ...(res.data.pagination || {}) }));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setMessage(error.response?.data?.error || 'Error fetching audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getActionBadgeClass = (action) => {
    if (action.includes('APPROVED')) return 'badge-success';
    if (action.includes('REJECTED')) return 'badge-danger';
    if (action.includes('UPDATED') || action.includes('CREATED')) return 'badge-info';
    return 'badge-secondary';
  };

  return (
    <div className="audit-logs-page">
      <div className="page-header">
        <h1>System Audit Logs</h1>
        <p>View all system activities and administrative actions</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Date:</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>User ID:</label>
          <input
            type="number"
            placeholder="Filter by user ID"
            value={filters.user}
            onChange={(e) => handleFilterChange('user', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Action:</label>
          <input
            type="text"
            placeholder="Filter by action"
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
          />
        </div>
        <button onClick={fetchLogs} className="refresh-btn">Refresh</button>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Logs Table */}
      {loading && logs.length === 0 ? (
        <div className="loading">Loading audit logs...</div>
      ) : logs.length === 0 ? (
        <div className="no-data">No audit logs found</div>
      ) : (
        <>
          <div className="logs-table-section">
            <div className="table-header">
              <h2>Audit Logs</h2>
              <span className="total-logs">Total: {pagination.total} logs</span>
            </div>
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Target Type</th>
                  <th>Target ID</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.created_at)}</td>
                    <td>
                      {log.user_name || `User #${log.user_id}`}
                      {log.user_email && (
                        <div className="user-email">{log.user_email}</div>
                      )}
                    </td>
                    <td><span className={`badge badge-role badge-${log.role}`}>{log.role}</span></td>
                    <td>
                      <span className={`badge ${getActionBadgeClass(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>{log.target_type || 'N/A'}</td>
                    <td>{log.target_id || 'N/A'}</td>
                    <td className="details-cell">
                      {log.details ? (
                        <details>
                          <summary>View Details</summary>
                          <pre>{typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}</pre>
                        </details>
                      ) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.total_pages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

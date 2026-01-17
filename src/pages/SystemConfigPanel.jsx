// System Configuration Panel - Admin Dashboard
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './SystemConfigPanel.css';

export default function SystemConfigPanel() {
  const { user } = useAuth();
  const [config, setConfig] = useState({});
  const [editedConfig, setEditedConfig] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get('/admin/config');
      const configData = res.data.config || {};
      setConfig(configData);
      setEditedConfig(configData);
    } catch (error) {
      console.error('Error fetching config:', error);
      setMessage(error.response?.data?.error || 'Error fetching system configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key, value) => {
    setEditedConfig(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: value
      }
    }));
  };

  const handleSave = (key) => {
    setSelectedKey(key);
    setShowConfirmModal(true);
  };

  const confirmSave = async () => {
    if (!selectedKey) return;

    setSaving(true);
    setMessage('');
    setShowConfirmModal(false);

    const configItem = editedConfig[selectedKey];
    const oldValue = config[selectedKey]?.value;
    const newValue = configItem.value;

    try {
      await api.put('/admin/config', {
        config_key: selectedKey,
        config_value: newValue
      });

      setMessage(`Configuration '${selectedKey}' updated successfully`);
      setConfig(prev => ({
        ...prev,
        [selectedKey]: configItem
      }));
      fetchConfig(); // Refresh to get updated_by info
    } catch (error) {
      console.error('Error updating config:', error);
      setMessage(error.response?.data?.error || 'Error updating configuration');
      // Revert changes on error
      setEditedConfig(config);
    } finally {
      setSaving(false);
      setSelectedKey(null);
    }
  };

  const handleCancel = (key) => {
    setEditedConfig(prev => ({
      ...prev,
      [key]: config[key]
    }));
  };

  const formatValue = (value, dataType) => {
    if (value === null || value === undefined) return '';
    if (dataType === 'boolean') return String(value);
    return String(value);
  };

  const renderInput = (key, configItem) => {
    const dataType = configItem.data_type;
    const value = editedConfig[key]?.value ?? configItem.value;

    switch (dataType) {
      case 'boolean':
        return (
          <select
            value={String(value)}
            onChange={(e) => handleConfigChange(key, e.target.value === 'true')}
            className="config-input"
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={formatValue(value, dataType)}
            onChange={(e) => handleConfigChange(key, parseFloat(e.target.value) || 0)}
            className="config-input"
          />
        );
      case 'json':
        return (
          <textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            onChange={(e) => {
              try {
                handleConfigChange(key, JSON.parse(e.target.value));
              } catch {
                handleConfigChange(key, e.target.value);
              }
            }}
            className="config-input config-textarea"
            rows="4"
          />
        );
      default:
        return (
          <input
            type="text"
            value={formatValue(value, dataType)}
            onChange={(e) => handleConfigChange(key, e.target.value)}
            className="config-input"
          />
        );
    }
  };

  const hasChanges = (key) => {
    const original = config[key]?.value;
    const edited = editedConfig[key]?.value;
    return JSON.stringify(original) !== JSON.stringify(edited);
  };

  return (
    <div className="system-config-page">
      <div className="page-header">
        <h1>System Configuration Panel</h1>
        <p>Manage system-wide settings and configurations</p>
      </div>

      <div className="actions-header">
        <button onClick={fetchConfig} className="refresh-btn">Refresh</button>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {loading && Object.keys(config).length === 0 ? (
        <div className="loading">Loading system configuration...</div>
      ) : Object.keys(config).length === 0 ? (
        <div className="no-data">No system configuration available</div>
      ) : (
        <div className="config-section">
          <h2>Configuration Settings</h2>
          <div className="config-grid">
            {Object.entries(config).map(([key, configItem]) => (
              <div key={key} className="config-card">
                <div className="config-header">
                  <h3>{key.replace(/_/g, ' ').toUpperCase()}</h3>
                  <span className="config-type">{configItem.data_type}</span>
                </div>
                <div className="config-body">
                  {configItem.description && (
                    <p className="config-description">{configItem.description}</p>
                  )}
                  <div className="config-input-group">
                    <label>Value:</label>
                    {renderInput(key, configItem)}
                  </div>
                  {configItem.updated_by && (
                    <p className="config-meta">
                      Last updated by: {configItem.updated_by} on {new Date(configItem.updated_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="config-actions">
                  {hasChanges(key) ? (
                    <>
                      <button
                        onClick={() => handleSave(key)}
                        className="save-btn"
                        disabled={saving}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleCancel(key)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <span className="no-changes">No changes</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Configuration Change</h3>
            {selectedKey && (
              <>
                <p><strong>Key:</strong> {selectedKey.replace(/_/g, ' ').toUpperCase()}</p>
                <p><strong>Old Value:</strong> {String(config[selectedKey]?.value)}</p>
                <p><strong>New Value:</strong> {String(editedConfig[selectedKey]?.value)}</p>
              </>
            )}
            <div className="modal-actions">
              <button onClick={confirmSave} className="confirm-btn" disabled={saving}>
                {saving ? 'Saving...' : 'Confirm'}
              </button>
              <button onClick={() => setShowConfirmModal(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { getSettings, updateSettings, resetData } from '../services/store';

interface BaseViewProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const BaseView: React.FC<BaseViewProps> = ({ darkMode, onToggleDarkMode }) => {
  const settings = getSettings();

  const handleNameChange = (name: string) => {
    updateSettings({ userName: name });
  };

  const handleEmailChange = (email: string) => {
    updateSettings({ userEmail: email });
  };

  return (
    <div className="base-view">
      <div className="base-header">
        <h2>Settings</h2>
        <p className="dashboard-subtitle">Manage your application preferences</p>
      </div>

      <div className="base-sections">
        <div className="base-section">
          <h3>Profile</h3>
          <div className="base-field">
            <label>Display Name</label>
            <input className="settings-input" defaultValue={settings.userName} onChange={(e) => handleNameChange(e.target.value)} />
          </div>
          <div className="base-field">
            <label>Email</label>
            <input className="settings-input" defaultValue={settings.userEmail} onChange={(e) => handleEmailChange(e.target.value)} />
          </div>
        </div>

        <div className="base-section">
          <h3>Appearance</h3>
          <div className="base-field-row">
            <div className="base-field-info">
              <label>Dark Mode</label>
              <span className="base-field-desc">Switch between light and dark themes</span>
            </div>
            <button className={`toggle-btn ${darkMode ? 'active' : ''}`} onClick={onToggleDarkMode}>
              <div className="toggle-knob" />
            </button>
          </div>
        </div>

        <div className="base-section">
          <h3>Notifications</h3>
          <div className="base-field-row">
            <div className="base-field-info">
              <label>Push Notifications</label>
              <span className="base-field-desc">Receive notifications for project updates</span>
            </div>
            <button className={`toggle-btn ${settings.notificationsEnabled ? 'active' : ''}`} onClick={() => { updateSettings({ notificationsEnabled: !settings.notificationsEnabled }); }}>
              <div className="toggle-knob" />
            </button>
          </div>
        </div>

        <div className="base-section">
          <h3>Data Management</h3>
          <div className="base-actions">
            <button className="btn-secondary" onClick={() => {
              const dataStr = JSON.stringify(localStorage.getItem('project-agent-data'));
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `project-agent-backup-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}>📥 Export Data</button>
            <button className="btn-secondary" style={{ color: '#EF4444' }} onClick={() => {
              if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                resetData();
                window.location.reload();
              }
            }}>🗑️ Reset All Data</button>
          </div>
        </div>

        <div className="base-section">
          <h3>Keyboard Shortcuts</h3>
          <div className="shortcuts-list">
            <div className="shortcut-item"><kbd>Ctrl+N</kbd><span>New Project</span></div>
            <div className="shortcut-item"><kbd>Ctrl+F</kbd><span>Search</span></div>
            <div className="shortcut-item"><kbd>Esc</kbd><span>Close modal / Cancel</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseView;
import React from 'react';
import { getSettings } from '../services/store';

const AccountView: React.FC = () => {
  const settings = getSettings();
  return (
    <div className="base-view">
      <div className="base-header"><h2>👤 Account</h2></div>
      <div className="base-sections">
        <div className="base-section">
          <h3>Profile</h3>
          <div className="base-field"><label>Name</label><input className="settings-input" defaultValue={settings.userName} /></div>
          <div className="base-field"><label>Email</label><input className="settings-input" defaultValue={settings.userEmail} /></div>
        </div>
        <div className="base-section">
          <h3>Activity</h3>
          <div className="activity-item"><span className="activity-dot" /><div><p>Logged in from <strong>Windows 11 - Chrome</strong></p><span className="activity-time">Today at 4:30 PM</span></div></div>
          <div className="activity-item"><span className="activity-dot green" /><div><p>Updated <strong>E-Commerce Platform</strong> project settings</p><span className="activity-time">Today at 3:15 PM</span></div></div>
          <div className="activity-item"><span className="activity-dot blue" /><div><p>Created <strong>Project Notes</strong> in Website Redesign</p><span className="activity-time">Yesterday at 11:20 AM</span></div></div>
        </div>
        <div className="base-section">
          <h3>API Keys</h3>
          <div className="file-card"><span className="file-icon">🔑</span><div className="file-info"><span className="file-name">Personal Access Token</span><span className="file-meta">Created Jan 15, 2026 · Expires never</span></div></div>
        </div>
      </div>
    </div>
  );
};
export default AccountView;
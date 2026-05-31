import React from 'react';

const DataView: React.FC = () => {
  return (
    <div className="base-view">
      <div className="base-header"><h2>📊 Data</h2></div>
      <div className="base-sections">
        <div className="base-section">
          <h3>Email</h3>
          <div className="file-card"><span className="file-icon">📧</span><div className="file-info"><span className="file-name">team@projectagent.io</span><span className="file-meta">Connected via SMTP</span></div></div>
        </div>
        <div className="base-section">
          <h3>Websites</h3>
          <div className="file-card"><span className="file-icon">🌐</span><div className="file-info"><span className="file-name">projectagent.io</span><span className="file-meta">Production</span></div></div>
          <div className="file-card"><span className="file-icon">🌐</span><div className="file-info"><span className="file-name">staging.projectagent.io</span><span className="file-meta">Staging</span></div></div>
        </div>
        <div className="base-section">
          <h3>Colleagues & Contacts</h3>
          <div className="file-card"><span className="file-icon">👥</span><div className="file-info"><span className="file-name">Alice Johnson</span><span className="file-meta">Design Lead · alice@projectagent.io</span></div></div>
          <div className="file-card"><span className="file-icon">👥</span><div className="file-info"><span className="file-name">Bob Smith</span><span className="file-meta">Developer · bob@projectagent.io</span></div></div>
        </div>
        <div className="base-section">
          <h3>Family Notes</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Personal notes and reminders for family-related items.</p>
        </div>
      </div>
    </div>
  );
};
export default DataView;
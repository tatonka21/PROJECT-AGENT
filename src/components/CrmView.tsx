import React from 'react';

const CrmView: React.FC = () => {
  return (
    <div className="base-view">
      <div className="base-header"><h2>🔒 CRM (HubSpot)</h2></div>
      <div className="info-card">
        <p>HubSpot CRM integration — manage contacts, deals, and pipelines. Connect with GitHub and Linear for full sales-to-code traceability.</p>
        <div className="integration-status"><span className="status-indicator"><span className="status-dot" style={{ background: '#EF4444' }} /> Not Connected</span></div>
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="file-card" style={{ cursor: 'pointer' }}><span className="file-icon">🔗</span><div className="file-info"><span className="file-name">Connect HubSpot</span><span className="file-meta">OAuth integration with HubSpot CRM</span></div></div>
          <div className="file-card" style={{ cursor: 'pointer', opacity: 0.5 }}><span className="file-icon">👥</span><div className="file-info"><span className="file-name">Contacts</span><span className="file-meta">View and manage customer contacts</span></div></div>
          <div className="file-card" style={{ cursor: 'pointer', opacity: 0.5 }}><span className="file-icon">💼</span><div className="file-info"><span className="file-name">Deals Pipeline</span><span className="file-meta">Track deals, stages, and revenue</span></div></div>
        </div>
      </div>
    </div>
  );
};
export default CrmView;
import React from 'react';

const ApiView: React.FC = () => {
  return (
    <div className="base-view">
      <div className="base-header"><h2>🔌 APIs</h2></div>
      <div className="info-card">
        <p>Manage API keys, webhooks, and endpoints for the Project Agent. All integrations connect through this hub.</p>
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="file-card"><span className="file-icon">🔑</span><div className="file-info"><span className="file-name">Project Agent API v1</span><span className="file-meta">RESTful · Base URL: https://api.projectagent.io/v1</span></div><span className="status-dot" style={{ background: '#10B981' }} /></div>
          <div className="file-card"><span className="file-icon">🔗</span><div className="file-info"><span className="file-name">GitHub API</span><span className="file-meta">REST + GraphQL · Connected</span></div><span className="status-dot" style={{ background: '#EF4444' }} /></div>
          <div className="file-card"><span className="file-icon">📢</span><div className="file-info"><span className="file-name">Webhooks</span><span className="file-meta">3 active endpoints</span></div></div>
        </div>
      </div>
    </div>
  );
};
export default ApiView;
import React from 'react';

const MiscView: React.FC = () => {
  return (
    <div className="base-view">
      <div className="base-header"><h2>📌 Misc</h2></div>
      <div className="info-card">
        <p>Miscellaneous notes, ideas, and quick captures for the Project Agent environment.</p>
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="file-card"><span className="file-icon">💡</span><div className="file-info"><span className="file-name">Ideas & Brainstorming</span><span className="file-meta">Quick capture for new feature ideas</span></div></div>
          <div className="file-card"><span className="file-icon">📝</span><div className="file-info"><span className="file-name">Scratchpad</span><span className="file-meta">Temporary notes and quick thoughts</span></div></div>
          <div className="file-card"><span className="file-icon">📋</span><div className="file-info"><span className="file-name">To Investigate</span><span className="file-meta">Items needing further research</span></div></div>
        </div>
      </div>
    </div>
  );
};
export default MiscView;
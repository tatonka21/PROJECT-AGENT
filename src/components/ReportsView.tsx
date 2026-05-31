// ============================================================
// Reports View — Automated report generation
// Weekly status, executive summaries, custom reports
// ============================================================
import React, { useState } from 'react';
import { generateWeeklyStatusReport, generateExecutiveSummary, generateCustomReport, getReports, deleteReport, type Report } from '../services/reportGenerator';

const ReportsView: React.FC = () => {
  const [reports, setReports] = useState<Report[]>(getReports());
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [customTitle, setCustomTitle] = useState('');

  const refresh = () => setReports([...getReports()]);

  return (
    <div className="base-view">
      <div className="base-header"><h2>📄 Reports</h2></div>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Generate automated reports: weekly status, executive summaries, and custom reports.
      </p>

      {/* Generate Buttons */}
      <div className="info-card" style={{ marginBottom: '16px' }}>
        <h4>📤 Generate Report</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
          <button className="btn-primary btn-sm" onClick={() => { generateWeeklyStatusReport(); refresh(); }}>📊 Weekly Status</button>
          <button className="btn-primary btn-sm" onClick={() => { generateExecutiveSummary(); refresh(); }}>🏢 Executive Summary</button>
          <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '300px' }}>
            <input className="modal-input" value={customTitle} onChange={e => setCustomTitle(e.target.value)} placeholder="Custom report title..." style={{ flex: 1 }} />
            <button className="btn-secondary btn-sm" onClick={() => { if (customTitle) { generateCustomReport(customTitle); setCustomTitle(''); refresh(); } }}>➕ Custom</button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="info-card" style={{ marginBottom: '16px' }}>
        <h4>📋 Generated Reports ({reports.length})</h4>
        {reports.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No reports generated yet. Click a button above to create your first report.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {reports.map(r => (
            <div key={r.id} className="file-card" style={{ cursor: 'pointer' }} onClick={() => setActiveReport(r)}>
              <span className="file-icon">{r.type === 'weekly' ? '📊' : r.type === 'executive' ? '🏢' : '📄'}</span>
              <div className="file-info">
                <div className="file-name">{r.title}</div>
                <div className="file-meta">{r.type} · {new Date(r.generatedAt).toLocaleString()} · {r.content.length} chars</div>
              </div>
              <button className="btn-icon-small" onClick={(e) => { e.stopPropagation(); deleteReport(r.id); refresh(); }} title="Delete">🗑️</button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Report Preview */}
      {activeReport && (
        <div className="info-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4>📄 {activeReport.title}</h4>
            <button className="btn-icon-small" onClick={() => setActiveReport(null)}>✖️</button>
          </div>
          <div className="message-bubble" style={{ whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '1.7', maxHeight: '500px', overflowY: 'auto' }}>
            {activeReport.content}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
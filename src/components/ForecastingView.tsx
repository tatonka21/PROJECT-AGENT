// ============================================================
// Forecasting View — Velocity analysis, predictions, resource recommendations
// ============================================================
import React, { useState } from 'react';
import { getForecastSummary, type Prediction } from '../services/planningEngine';

const ForecastingView: React.FC = () => {
  const [summary, setSummary] = useState(getForecastSummary());

  const refresh = () => setSummary(getForecastSummary());

  return (
    <div className="base-view">
      <div className="base-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>📈 Planning & Forecasting</h2>
        <button className="btn-primary btn-sm" onClick={refresh}>🔄 Refresh</button>
      </div>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Velocity analysis, delivery date predictions, risk assessment, and resource recommendations.
      </p>

      {/* KPI Row */}
      <div className="dashboard-kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '16px' }}>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">📊</span>
          <div className="kpi-info"><span className="kpi-value">{summary.totalProjects}</span><span className="kpi-label">Projects</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">✅</span>
          <div className="kpi-info"><span className="kpi-value">{summary.onTrack}</span><span className="kpi-label">On Track</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">⚠️</span>
          <div className="kpi-info"><span className="kpi-value">{summary.atRisk}</span><span className="kpi-label">At Risk</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">🚨</span>
          <div className="kpi-info"><span className="kpi-value">{summary.critical}</span><span className="kpi-label">Critical</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">📈</span>
          <div className="kpi-info"><span className="kpi-value">{summary.avgVelocity}</span><span className="kpi-label">Avg Velocity</span></div>
        </div>
      </div>

      {/* Predictions */}
      <div className="info-card" style={{ marginBottom: '16px' }}>
        <h4>🎯 Project Predictions</h4>
        {summary.predictions.map(p => (
          <div key={p.projectId} className="file-card" style={{
            marginBottom: '8px',
            borderLeft: `4px solid ${p.riskLevel === 'high' ? '#EF4444' : p.riskLevel === 'medium' ? '#F59E0B' : '#10B981'}`
          }}>
            <span className="file-icon">{p.riskLevel === 'high' ? '🚨' : p.riskLevel === 'medium' ? '⚠️' : '✅'}</span>
            <div className="file-info">
              <div className="file-name">{p.projectName} — {p.completionRate}% complete</div>
              <div className="file-meta">
                Velocity: {p.velocity} tasks/day · Est completion: {new Date(p.estimatedCompletion).toLocaleDateString()}
                {p.predictedDelay > 0 && ` · ⏰ ${p.predictedDelay} days overdue`}
                · Confidence: {Math.round(p.confidence * 100)}%
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                {p.riskFactors.map((f, i) => <span key={i} className="tag-badge" style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>{f}</span>)}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                {p.recommendedActions.map((a, i) => <span key={i} className="tag-badge" style={{ background: 'rgba(59,130,246,0.08)', color: '#2563EB' }}>💡 {a}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Recommendations */}
      <div className="info-card">
        <h4>👥 Resource Recommendations</h4>
        <div className="file-card">
          <span className="file-icon">💡</span>
          <div className="file-info">
            <div className="file-name">{summary.resources.suggestion}</div>
            <div className="file-meta">
              {summary.resources.neededRoles.length > 0 && `Needed: ${summary.resources.neededRoles.map(r => `${r.count} ${r.role} (${r.urgency})`).join(', ')}`}
              {summary.resources.overallocation.length > 0 && ` · Overallocated: ${summary.resources.overallocation.map(o => o.memberName).join(', ')}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastingView;
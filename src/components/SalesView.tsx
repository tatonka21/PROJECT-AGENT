import React from 'react';

const SalesView: React.FC = () => {
  return (
    <div className="base-view">
      <div className="base-header"><h2>💰 Sales</h2></div>
      <div className="dashboard-kpi-grid" style={{ marginBottom: '20px' }}>
        <div className="kpi-card"><div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>📈</div><div className="kpi-info"><span className="kpi-value">$24,500</span><span className="kpi-label">MRR</span></div></div>
        <div className="kpi-card"><div className="kpi-icon" style={{ background: 'rgba(59,130,246,0.1)' }}>👥</div><div className="kpi-info"><span className="kpi-value">12</span><span className="kpi-label">Active Customers</span></div></div>
        <div className="kpi-card"><div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>💼</div><div className="kpi-info"><span className="kpi-value">8</span><span className="kpi-label">Open Deals</span></div></div>
        <div className="kpi-card"><div className="kpi-icon" style={{ background: 'rgba(139,92,246,0.1)' }}>📊</div><div className="kpi-info"><span className="kpi-value">$78K</span><span className="kpi-label">Pipeline Value</span></div></div>
      </div>
    </div>
  );
};
export default SalesView;
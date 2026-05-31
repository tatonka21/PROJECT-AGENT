import React from 'react';

const ProductsView: React.FC = () => {
  return (
    <div className="base-view">
      <div className="base-header"><h2>📦 Products</h2></div>
      <div className="info-card">
        <p>Product catalog for the Project Agent platform. Products managed here feed into the E-Commerce suite.</p>
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="file-card"><span className="file-icon">📦</span><div className="file-info"><span className="file-name">Project Agent Enterprise</span><span className="file-meta">$199/mo · Active subscribers: 12</span></div></div>
          <div className="file-card"><span className="file-icon">📦</span><div className="file-info"><span className="file-name">DPloy Add-on</span><span className="file-meta">$49/mo per DPloy · Active: 2</span></div></div>
          <div className="file-card"><span className="file-icon">📦</span><div className="file-info"><span className="file-name">Integration Suite</span><span className="file-meta">$79/mo · GitHub + Linear + Slack</span></div></div>
        </div>
      </div>
    </div>
  );
};
export default ProductsView;
import React from 'react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'projects', icon: '📁', label: 'Projects' },
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'notes', icon: '📝', label: 'Notes' },
  { id: 'kb', icon: '📚', label: 'Base' },
  { id: 'scrape', icon: '🌐', label: 'Scrape' },
  { id: 'list', icon: '📋', label: 'Lists' },
  { id: 'doctools', icon: '📖', label: 'Docs' },
  { id: 'agenttab', icon: '🧠', label: 'Agent' },
  { id: 'multiagent', icon: '👥', label: 'Multi' },
  { id: 'agentmonitor', icon: '📊', label: 'Monitr' },
  { id: 'files', icon: '📂', label: 'Files' },
  { id: 'team', icon: '👥', label: 'Team' },
  { id: 'messaging', icon: '💬', label: 'Chat' },
  { id: 'crm', icon: '🔒', label: 'CRM' },
  { id: 'sales', icon: '💰', label: 'Sales' },
  { id: 'leads', icon: '🎯', label: 'Leads' },
  { id: 'goals', icon: '🎯', label: 'Goals' },
  { id: 'planning', icon: '📋', label: 'Plan' },
  { id: 'products', icon: '📦', label: 'Prod.' },
  { id: 'data', icon: '📊', label: 'Data' },
  { id: 'account', icon: '👤', label: 'Acct' },
  { id: 'apis', icon: '🔌', label: 'APIs' },
  { id: 'misc', icon: '📌', label: 'Misc' },
  { id: 'deps', icon: '🔗', label: 'Deps' },
  { id: 'audit', icon: '📋', label: 'Audit' },
  { id: 'integrations', icon: '🔌', label: 'Integ.' },
  { id: 'base', icon: '⚙️', label: 'Settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <rect width="26" height="26" rx="6" fill="white" fillOpacity="0.2"/>
            <path d="M6.5 9.5L13 6.5L19.5 9.5V16.5L13 19.5L6.5 16.5V9.5Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="9.5" cy="13" r="1.5" fill="white" fillOpacity="0.9"/>
            <circle cx="13" cy="13" r="1.5" fill="white" fillOpacity="0.9"/>
            <circle cx="16.5" cy="13" r="1.5" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-btn ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
            title={item.label}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-avatar">
          <span>U</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
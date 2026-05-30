import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ProjectGrid from './components/ProjectGrid';
import ProjectHome from './components/ProjectHome';
import AIPanel from './components/AIPanel';
import type { Project } from './types';

const initialProjects: Project[] = [
  { id: 1, name: 'Website Redesign', description: 'Complete overhaul of the company website with modern UI/UX design principles and improved performance.', status: 'active', progress: 65, tasks: { total: 24, completed: 16 }, dueDate: 'Jun 15', priority: 'high' },
  { id: 2, name: 'Mobile App v2', description: 'Version 2 of the mobile application with new features including offline mode and push notifications.', status: 'active', progress: 35, tasks: { total: 32, completed: 11 }, dueDate: 'Jul 20', priority: 'high' },
  { id: 3, name: 'API Integration Hub', description: 'Central API gateway for third-party integrations with authentication and rate limiting.', status: 'on-hold', progress: 80, tasks: { total: 18, completed: 14 }, dueDate: 'May 30', priority: 'medium' },
  { id: 4, name: 'Data Analytics Dashboard', description: 'Real-time analytics dashboard with custom reporting, charts, and export capabilities.', status: 'in-progress', progress: 20, tasks: { total: 28, completed: 6 }, dueDate: 'Aug 10', priority: 'medium' },
  { id: 5, name: 'Security Audit Q2', description: 'Quarterly security audit including penetration testing, code review, and compliance checks.', status: 'completed', progress: 100, tasks: { total: 15, completed: 15 }, dueDate: 'May 1', priority: 'high' },
  { id: 6, name: 'Customer Portal', description: 'Self-service customer portal with ticket management, knowledge base, and live chat.', status: 'active', progress: 45, tasks: { total: 20, completed: 9 }, dueDate: 'Jun 30', priority: 'low' },
  { id: 7, name: 'DevOps Pipeline', description: 'Automated CI/CD pipeline with Docker containerization and Kubernetes orchestration.', status: 'active', progress: 55, tasks: { total: 14, completed: 8 }, dueDate: 'Jun 5', priority: 'medium' },
  { id: 8, name: 'E-Commerce Platform', description: 'Full-featured e-commerce platform with payment processing, inventory management, and analytics.', status: 'active', progress: 40, tasks: { total: 36, completed: 14 }, dueDate: 'Aug 20', priority: 'high' },
];

type ViewMode = 'grid' | 'detail';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('projects');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setViewMode('detail');
  };

  const handleBackToGrid = () => {
    setViewMode('grid');
    setSelectedProject(null);
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setSelectedProject(updated);
  };

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="app-title">Project Hub</h1>
            <div className="top-bar-nav">
              <button className={`nav-link ${activeView === 'projects' ? 'active' : ''}`} onClick={() => setActiveView('projects')}>Projects</button>
              <button className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>Dashboard</button>
              <button className={`nav-link ${activeView === 'team' ? 'active' : ''}`} onClick={() => setActiveView('team')}>Team</button>
            </div>
          </div>
          <div className="top-bar-right">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search anything..." />
            </div>
            <button className="btn-icon" title="Notifications">🔔</button>
            <div className="user-avatar"><span>JD</span></div>
          </div>
        </header>
        <div className="workspace">
          {viewMode === 'grid' ? (
            <div className="card-grid-view">
              <ProjectGrid projects={projects} onSelectProject={handleSelectProject} />
              <AIPanel />
            </div>
          ) : (
            <div className="project-home-view">
              <ProjectHome project={selectedProject!} onBack={handleBackToGrid} onUpdateProject={handleUpdateProject} />
              <AIPanel />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
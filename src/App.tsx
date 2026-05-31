import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ProjectGrid from './components/ProjectGrid';
import ProjectHome from './components/ProjectHome';
import DashboardView from './components/DashboardView';
import NotesView from './components/NotesView';
import KnowledgeBase from './components/KnowledgeBase';
import FilesView from './components/FilesView';
import TeamView from './components/TeamView';
import MessagingView from './components/MessagingView';
import BaseView from './components/BaseView';
import CrmView from './components/CrmView';
import ScrapePage from './components/ScrapePage';
import AgentTab from './components/AgentTab';
import ListPage from './components/ListPage';
import DocToolsPage from './components/DocToolsPage';
import AccountView from './components/AccountView';
import ApiView from './components/ApiView';
import GoalsView from './components/GoalsView';
import PlanningView from './components/PlanningView';
import ProductsView from './components/ProductsView';
import DataView from './components/DataView';
import SalesView from './components/SalesView';
import LeadsView from './components/LeadsView';
import MiscView from './components/MiscView';
import AIPanel from './components/AIPanel';
import NewProjectModal from './components/NewProjectModal';
import NotificationPanel from './components/NotificationPanel';
import SearchOverlay from './components/SearchOverlay';
import ErrorBoundary from './components/ErrorBoundary';
import type { Project } from './types';
import { getProjects, updateProject, addProject, deleteProject, archiveProject, getSettings, updateSettings, getUnreadNotificationCount } from './services/store';

type ViewMode = 'grid' | 'detail';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('projects');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>(getProjects());
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [darkMode, setDarkMode] = useState(getSettings().darkMode);
  const [unreadCount, setUnreadCount] = useState(getUnreadNotificationCount());
  const [refreshKey, setRefreshKey] = useState(0);

  // Apply dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Refresh data from store
  const refresh = useCallback(() => {
    setProjects(getProjects());
    setUnreadCount(getUnreadNotificationCount());
    setRefreshKey((k) => k + 1);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowNewProject(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowNewProject(false);
        setShowNotifications(false);
        setShowSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setViewMode('detail');
  };

  const handleBackToGrid = () => {
    setViewMode('grid');
    setSelectedProject(null);
    refresh();
  };

  const handleUpdateProject = (updated: Project) => {
    updateProject(updated.id, updated);
    setSelectedProject(updated);
    refresh();
  };

  const handleCreateProject = (data: { name: string; description: string; priority: 'high' | 'medium' | 'low'; dueDate: string; status: Project['status'] }) => {
    addProject({
      name: data.name,
      description: data.description,
      status: data.status,
      dueDate: data.dueDate,
      priority: data.priority,
      tags: [],
      team: [],
    });
    setShowNewProject(false);
    refresh();
  };

  const handleDeleteProject = (id: number) => {
    deleteProject(id);
    if (selectedProject?.id === id) {
      setViewMode('grid');
      setSelectedProject(null);
    }
    refresh();
  };

  const handleArchiveProject = (id: number) => {
    archiveProject(id);
    if (selectedProject?.id === id) {
      setViewMode('grid');
      setSelectedProject(null);
    }
    refresh();
  };

  const handleToggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    updateSettings({ darkMode: newMode });
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    if (view === 'projects') {
      setViewMode('grid');
      setSelectedProject(null);
    }
    refresh();
  };

  const renderMainContent = () => {
    if (activeView === 'projects') {
      if (viewMode === 'grid') {
        return (
          <div className="card-grid-view">
            <ProjectGrid
              key={refreshKey}
              projects={projects}
              onSelectProject={handleSelectProject}
              onNewProject={() => setShowNewProject(true)}
              onDeleteProject={handleDeleteProject}
              onArchiveProject={handleArchiveProject}
            />
            <AIPanel />
          </div>
        );
      }
      return (
        <div className="project-home-view">
          <ProjectHome
            key={refreshKey}
            project={selectedProject!}
            onBack={handleBackToGrid}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={() => handleDeleteProject(selectedProject!.id)}
            onArchiveProject={() => handleArchiveProject(selectedProject!.id)}
          />
          <AIPanel />
        </div>
      );
    }

    if (activeView === 'dashboard') return <DashboardView key={refreshKey} projects={projects} />;
    if (activeView === 'notes') return <ErrorBoundary name="Notes"><NotesView key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'kb') return <ErrorBoundary name="Knowledge Base"><KnowledgeBase key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'files') return <ErrorBoundary name="Files"><FilesView key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'team') return <ErrorBoundary name="Team"><TeamView key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'messaging') return <ErrorBoundary name="Messaging"><MessagingView key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'base') return <ErrorBoundary name="Settings"><BaseView key={refreshKey} darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode} /></ErrorBoundary>;
    if (activeView === 'scrape') return <ErrorBoundary name="Scrape"><ScrapePage key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'agenttab') return <ErrorBoundary name="Agent Tab"><AgentTab key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'list') return <ErrorBoundary name="List Builder"><ListPage key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'doctools') return <ErrorBoundary name="Documentation & Tools"><DocToolsPage key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'crm') return <ErrorBoundary name="CRM"><CrmView key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'account') return <ErrorBoundary name="Account"><AccountView key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'apis') return <ErrorBoundary name="APIs"><ApiView key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'goals') return <ErrorBoundary name="Goals"><GoalsView key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'planning') return <ErrorBoundary name="Planning"><PlanningView key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'products') return <ErrorBoundary name="Products"><ProductsView key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'data') return <ErrorBoundary name="Data"><DataView key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'sales') return <ErrorBoundary name="Sales"><SalesView key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'leads') return <ErrorBoundary name="Leads"><LeadsView key={refreshKey} /></ErrorBoundary>;
    if (activeView === 'misc') return <ErrorBoundary name="Misc"><MiscView key={refreshKey} /></ErrorBoundary>;

    // Fallback
    return (
      <div className="card-grid-view">
        <ProjectGrid
          key={refreshKey}
          projects={projects}
          onSelectProject={handleSelectProject}
          onNewProject={() => setShowNewProject(true)}
          onDeleteProject={handleDeleteProject}
          onArchiveProject={handleArchiveProject}
        />
        <AIPanel />
      </div>
    );
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="app-title">Project Agent</h1>
            <div className="top-bar-nav">
              <button className={`nav-link ${activeView === 'projects' ? 'active' : ''}`} onClick={() => handleViewChange('projects')}>Projects</button>
              <button className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => handleViewChange('dashboard')}>Dashboard</button>
              <button className={`nav-link ${activeView === 'team' ? 'active' : ''}`} onClick={() => handleViewChange('team')}>Team</button>
            </div>
          </div>
          <div className="top-bar-right">
            <div className="search-bar" onClick={() => setShowSearch(true)} style={{ cursor: 'pointer' }}>
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search anything... (Ctrl+F)" readOnly onFocus={() => setShowSearch(true)} />
            </div>
            <button className="btn-icon" title="Notifications" onClick={() => setShowNotifications(!showNotifications)} style={{ position: 'relative' }}>
              🔔
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            <div className="user-avatar"><span>JD</span></div>
          </div>
        </header>
        <div className="workspace">
          {renderMainContent()}
        </div>
      </main>

      {showNewProject && (
        <NewProjectModal
          onClose={() => setShowNewProject(false)}
          onCreate={handleCreateProject}
        />
      )}

      {showNotifications && (
        <NotificationPanel
          onClose={() => setShowNotifications(false)}
          onRefresh={refresh}
        />
      )}

      {showSearch && (
        <SearchOverlay
          onClose={() => setShowSearch(false)}
          onSelectProject={(p) => {
            setShowSearch(false);
            setSelectedProject(p);
            setViewMode('detail');
            setActiveView('projects');
          }}
        />
      )}
    </div>
  );
};

export default App;
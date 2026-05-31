import React, { useState } from 'react';
import type { Project } from '../types';

interface NewProjectModalProps {
  onClose: () => void;
  onCreate: (data: { name: string; description: string; priority: 'high' | 'medium' | 'low'; dueDate: string; status: Project['status'] }) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<Project['status']>('active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: description.trim(), priority, dueDate: dueDate || 'TBD', status });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="modal-field">
              <label>Project Name</label>
              <input className="modal-input" value={name} onChange={(e) => setName(e.target.value.slice(0, 50))} placeholder="Enter project name..." maxLength={50} autoFocus required />
            </div>
            <div className="modal-field">
              <label>Description</label>
              <textarea className="modal-textarea" value={description} onChange={(e) => setDescription(e.target.value.slice(0, 200))} placeholder="Brief description..." maxLength={200} rows={3} />
            </div>
            <div className="modal-field-row">
              <div className="modal-field">
                <label>Priority</label>
                <select className="modal-select" value={priority} onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="modal-field">
                <label>Status</label>
                <select className="modal-select" value={status} onChange={(e) => setStatus(e.target.value as Project['status'])}>
                  <option value="active">Active</option>
                  <option value="in-progress">In Progress</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              <div className="modal-field">
                <label>Due Date</label>
                <input className="modal-input" type="text" value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="e.g. Aug 15" />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={!name.trim()}>Create Project</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
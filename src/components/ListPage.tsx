import React, { useState } from 'react';

interface ListItem {
  id: number;
  name: string;
  url?: string;
  description?: string;
  category?: string;
}

const ListPage: React.FC = () => {
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [items, setItems] = useState<ListItem[]>([
    { id: 1, name: 'React', url: 'https://react.dev', description: 'UI library', category: 'Frontend' },
    { id: 2, name: 'TypeScript', url: 'https://typescriptlang.org', description: 'Typed JS', category: 'Language' },
    { id: 3, name: 'Vite', url: 'https://vitejs.dev', description: 'Build tool', category: 'Tooling' },
    { id: 4, name: 'Node.js', url: 'https://nodejs.org', description: 'Runtime', category: 'Backend' },
    { id: 5, name: 'PostgreSQL', url: 'https://postgresql.org', description: 'Database', category: 'Database' },
  ]);
  const [newItem, setNewItem] = useState({ name: '', url: '', description: '', category: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [generating, setGenerating] = useState(false);

  const addItem = () => {
    if (!newItem.name.trim()) return;
    setItems(prev => [...prev, { id: Date.now(), ...newItem }]);
    setNewItem({ name: '', url: '', description: '', category: '' });
  };

  const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id));

  const handleAIGenerate = () => {
    if (!listName.trim()) return;
    setGenerating(true);
    // Simulate AI generating a large list
    setTimeout(() => {
      const generated: ListItem[] = [
        { id: Date.now() + 1, name: 'Next.js', url: 'https://nextjs.org', description: 'React framework', category: 'Frontend' },
        { id: Date.now() + 2, name: 'Prisma', url: 'https://prisma.io', description: 'ORM', category: 'Database' },
        { id: Date.now() + 3, name: 'Docker', url: 'https://docker.com', description: 'Containerization', category: 'DevOps' },
        { id: Date.now() + 4, name: 'Kubernetes', url: 'https://kubernetes.io', description: 'Orchestration', category: 'DevOps' },
        { id: Date.now() + 5, name: 'GraphQL', url: 'https://graphql.org', description: 'API query language', category: 'API' },
        { id: Date.now() + 6, name: 'Redis', url: 'https://redis.io', description: 'Cache/Store', category: 'Database' },
        { id: Date.now() + 7, name: 'Tailwind CSS', url: 'https://tailwindcss.com', description: 'CSS framework', category: 'Frontend' },
        { id: Date.now() + 8, name: 'GitHub Actions', url: 'https://github.com/features/actions', description: 'CI/CD', category: 'DevOps' },
        { id: Date.now() + 9, name: 'Supabase', url: 'https://supabase.com', description: 'Backend as a Service', category: 'Backend' },
        { id: Date.now() + 10, name: 'Hugging Face', url: 'https://huggingface.co', description: 'ML/AI platform', category: 'AI' },
      ];
      setItems(prev => [...prev, ...generated]);
      setGenerating(false);
    }, 2000);
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];

  return (
    <div className="base-view">
      <div className="base-header"><h2>📋 List Builder</h2></div>
      <div className="base-sections">
        <div className="base-section">
          <h3>List Configuration</h3>
          <div className="base-field"><label>List Name</label><input className="settings-input" value={listName} onChange={(e) => setListName(e.target.value)} placeholder="e.g., Top Web Development Tools" /></div>
          <div className="base-field"><label>Description</label><textarea className="agent-task-desc" value={listDescription} onChange={(e) => setListDescription(e.target.value)} placeholder="Describe what this list should contain..." rows={2} /></div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-primary btn-sm" onClick={handleAIGenerate} disabled={generating || !listName.trim()}>
              {generating ? '⏳ AI Generating...' : '🤖 AI Generate List'}
            </button>
            <button className="btn-secondary btn-sm" onClick={() => { setItems([]); setListName(''); setListDescription(''); }}>Clear All</button>
          </div>
        </div>

        <div className="base-section">
          <h3>Add Item Manually</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <input className="modal-input" value={newItem.name} onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))} placeholder="Name" />
            <input className="modal-input" value={newItem.url} onChange={(e) => setNewItem(prev => ({ ...prev, url: e.target.value }))} placeholder="URL (optional)" />
            <input className="modal-input" value={newItem.category} onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))} placeholder="Category" />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input className="modal-input" value={newItem.description} onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" style={{ flex: 1 }} />
            <button className="btn-primary btn-sm" onClick={addItem}>+ Add</button>
          </div>
        </div>

        <div className="base-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>Items ({items.length})</h3>
            <div className="search-bar" style={{ width: '200px' }}>
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {categories.map(c => <span key={c} className="grid-filter-btn active" style={{ fontSize: '11px', padding: '3px 10px' }}>{c}</span>)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '400px', overflow: 'auto' }}>
            {filtered.map(item => (
              <div key={item.id} className="file-card">
                <span className="file-icon">📄</span>
                <div className="file-info">
                  <span className="file-name">{item.name}</span>
                  <span className="file-meta">{item.description} {item.category && `· ${item.category}`}</span>
                  {item.url && <span className="file-meta">🔗 {item.url}</span>}
                </div>
                <button className="btn-icon-small" onClick={() => removeItem(item.id)} title="Remove">🗑️</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ListPage;
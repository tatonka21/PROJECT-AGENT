import React, { useState } from 'react';
import MarkdownEditor from './MarkdownEditor';

const DocToolsPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState('write');
  const [content, setContent] = useState('# Welcome to Documentation & Tools\n\nThis is your all-in-one content creation workspace. Choose a tool below to get started.');

  const tools = [
    { id: 'write', icon: '✍️', label: 'Write', desc: 'Articles, docs, books, novels, textbooks, training courses, marketing copy, ads, social media posts, creative content' },
    { id: 'code', icon: '💻', label: 'Code', desc: 'Write in any language (JS, TS, Python, Rust, Go, C#, Solidity, etc.), explain code, debug, create full apps' },
    { id: 'research', icon: '🔬', label: 'Research', desc: 'Research reports, data compilation, analysis, source synthesis, academic writing' },
    { id: 'images', icon: '🎨', label: 'Images', desc: 'Generate images, icons, diagrams, visual content, UI mockups' },
    { id: 'videos', icon: '🎬', label: 'Videos', desc: 'Video scripts, storyboards, content planning, editing instructions' },
    { id: 'datasets', icon: '📊', label: 'Datasets', desc: 'Create datasets, data cleaning, formatting, Hugging Face datasets' },
    { id: 'huggingface', icon: '🤗', label: 'Hugging Face', desc: 'Model deployment, inference, training, datasets, Spaces, Gradio apps' },
    { id: 'llms', icon: '🧠', label: 'LLMs', desc: 'Prompt engineering, fine-tuning, RAG, embeddings, model evaluation' },
    { id: 'magic', icon: '✨', label: 'Magic Code', desc: 'Magic JavaScript, magical technology, arcane code, mystical systems' },
    { id: 'github', icon: '🐙', label: 'GitHub', desc: 'Repo analysis, README writing, issue management, PR reviews, Actions workflows' },
    { id: 'skills', icon: '🛠️', label: 'Agent Skills', desc: 'Write skills for agents, create tool definitions, build agent workflows' },
    { id: 'translate', icon: '🌍', label: 'Translate', desc: 'Language translation, localization, multilingual content' },
    { id: 'marketing', icon: '📢', label: 'Marketing', desc: 'Ad copy, email campaigns, landing pages, brand voice, content strategy' },
    { id: 'docs', icon: '📚', label: 'Technical Docs', desc: 'API docs, user guides, architecture docs, code comments, tutorials' },
  ];

  const activeToolData = tools.find(t => t.id === activeTool);

  return (
    <div className="base-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="base-header"><h2>📚 Documentation & Tools</h2></div>

      {/* Tool Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
        {tools.map(tool => (
          <div
            key={tool.id}
            className={`file-card ${activeTool === tool.id ? 'active' : ''}`}
            style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', padding: '14px', border: activeTool === tool.id ? '2px solid var(--primary)' : undefined }}
            onClick={() => { setActiveTool(tool.id); setContent(`# ${tool.label}\n\n${tool.desc}\n\nStart writing your ${tool.label.toLowerCase()} content here...`); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              <span style={{ fontSize: '24px' }}>{tool.icon}</span>
              <span className="file-name">{tool.label}</span>
            </div>
            <span className="file-meta" style={{ fontSize: '11px', lineHeight: '1.4' }}>{tool.desc}</span>
          </div>
        ))}
      </div>

      {/* Active Tool Info */}
      {activeToolData && (
        <div className="info-card">
          <h4>{activeToolData.icon} {activeToolData.label}</h4>
          <p>{activeToolData.desc}</p>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn-primary btn-sm">🤖 AI Generate</button>
            <button className="btn-secondary btn-sm">💾 Save to Notes</button>
            <button className="btn-secondary btn-sm">📋 Copy to Clipboard</button>
            <button className="btn-secondary btn-sm">📤 Export as Markdown</button>
          </div>
        </div>
      )}

      {/* Markdown Editor */}
      <div className="info-card" style={{ padding: 0, overflow: 'hidden' }}>
        <MarkdownEditor value={content} onChange={setContent} minHeight={400} />
      </div>
    </div>
  );
};
export default DocToolsPage;
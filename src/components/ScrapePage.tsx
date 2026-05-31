import React, { useState } from 'react';
import { addNote } from '../services/store';

const ScrapePage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [result, setResult] = useState<{ emails: string[]; phones: string[]; text: string; title: string } | null>(null);
  const [customAlgo, setCustomAlgo] = useState('');

  const handleScrape = async () => {
    if (!url.trim()) return;
    setScraping(true);
    setResult(null);
    try {
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
      const html = await response.text();
      const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Extract emails
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = [...new Set(text.match(emailRegex) || [])];

      // Extract phone numbers
      const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
      const phones = [...new Set(text.match(phoneRegex) || [])];

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : url;

      setResult({ emails, phones, text: text.slice(0, 3000), title });
    } catch (e) {
      setResult({ emails: [], phones: [], text: `Failed to scrape: ${e}`, title: url });
    }
    setScraping(false);
  };

  const saveToKB = () => {
    if (!result) return;
    addNote({
      title: `Scraped: ${result.title.slice(0, 60)}`,
      content: `# Scraped: ${result.title}\n\n**Source:** ${url}\n\n## Emails\n${result.emails.map(e => `- ${e}`).join('\n')}\n\n## Phones\n${result.phones.map(p => `- ${p}`).join('\n')}\n\n## Content\n${result.text}`,
      tags: ['kb', 'web', 'scraped'],
      pinned: false,
      color: '#3B82F6',
    });
  };

  return (
    <div className="base-view">
      <div className="base-header"><h2>🌐 Scrape Page</h2></div>
      <div className="base-sections">
        <div className="base-section">
          <h3>URL Scraper</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <input className="modal-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter URL to scrape..." style={{ flex: 1 }} />
            <button className="btn-primary btn-sm" onClick={handleScrape} disabled={scraping || !url.trim()}>
              {scraping ? '⏳ Scraping...' : '🔍 Scrape'}
            </button>
          </div>
        </div>

        {result && (
          <>
            <div className="base-section">
              <h3>📧 Emails Found ({result.emails.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {result.emails.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No emails found</p>}
                {result.emails.map((e, i) => (
                  <div key={i} className="file-card" style={{ cursor: 'pointer' }}>
                    <span className="file-icon">📧</span>
                    <div className="file-info"><span className="file-name">{e}</span></div>
                    <button className="btn-icon-small" onClick={() => navigator.clipboard.writeText(e)} title="Copy">📋</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="base-section">
              <h3>📞 Phone Numbers Found ({result.phones.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {result.phones.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No phone numbers found</p>}
                {result.phones.map((p, i) => (
                  <div key={i} className="file-card" style={{ cursor: 'pointer' }}>
                    <span className="file-icon">📞</span>
                    <div className="file-info"><span className="file-name">{p}</span></div>
                    <button className="btn-icon-small" onClick={() => navigator.clipboard.writeText(p)} title="Copy">📋</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="base-section">
              <h3>📄 Extracted Content</h3>
              <pre style={{ fontSize: '12px', color: 'var(--text-secondary)', maxHeight: '300px', overflow: 'auto', whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '8px' }}>{result.text.slice(0, 2000)}</pre>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-primary btn-sm" onClick={saveToKB}>💾 Save to Knowledge Base</button>
              <button className="btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}>📋 Copy All Data</button>
            </div>
          </>
        )}

        <div className="base-section">
          <h3>🧠 Custom Scraping Algorithm</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Describe what you want to extract (e.g., "find all product prices and descriptions"):</p>
          <textarea className="agent-task-desc" value={customAlgo} onChange={(e) => setCustomAlgo(e.target.value)} placeholder="Describe your custom scraping logic..." rows={3} />
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <button className="btn-primary btn-sm" disabled={!customAlgo.trim()}>🤖 Run AI Scraper</button>
            <button className="btn-secondary btn-sm" onClick={() => setCustomAlgo('')}>Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ScrapePage;
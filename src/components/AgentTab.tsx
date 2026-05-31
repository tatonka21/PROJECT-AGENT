import React, { useState } from 'react';

interface AgentMessage {
  id: number;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

const AgentTab: React.FC = () => {
  const [messages, setMessages] = useState<AgentMessage[]>([
    { id: 1, role: 'agent', content: 'Hello! I am your Project Agent. I can help you with:\n\n- **Scraping** — Extract data from websites, find emails/phones\n- **Writing** — Create content, documentation, code, books\n- **Research** — Compile reports, analyze data\n- **Lists** — Build extensive lists of items/websites/contacts\n- **Coding** — Write, explain, and debug code\n- **AI Tools** — Generate images, datasets, Hugging Face models\n\nWhat would you like me to do?', timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: AgentMessage = { id: Date.now(), role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setProcessing(true);

    // Simulate agent response
    setTimeout(() => {
      const responses: Record<string, string> = {
        scrape: 'I can scrape any website for you. Go to the **Scrape Page** (sidebar icon 🌐) and enter a URL. I will extract emails, phone numbers, and content. For custom scraping, describe what you want in the algorithm field.',
        write: 'I can write anything: articles, documentation, code, books, marketing copy, social media posts, technical docs, training materials, and more. Just tell me what you need and I will generate it with full markdown formatting.',
        list: 'I can build extensive lists of thousands of items. Tell me what you need — websites, products, contacts, research sources — and I will search the internet intelligently to compile them.',
        code: 'I can write code in any language: JavaScript, TypeScript, Python, Rust, Go, C#, Solidity, and more. I can explain code, debug issues, write tests, and create full applications.',
        research: 'I can research any topic and compile comprehensive reports with data, sources, and analysis. I can search the web, analyze documents, and synthesize findings.',
        default: 'I understand! Let me work on that for you. I can scrape websites, write content, build lists, write code, do research, generate datasets, create images, and much more. Please be specific about what you need and I will handle it.',
      };
      const lower = input.toLowerCase();
      let response = responses.default;
      if (lower.includes('scrape') || lower.includes('extract')) response = responses.scrape;
      else if (lower.includes('write') || lower.includes('content') || lower.includes('book') || lower.includes('doc')) response = responses.write;
      else if (lower.includes('list') || lower.includes('compile')) response = responses.list;
      else if (lower.includes('code') || lower.includes('program') || lower.includes('script')) response = responses.code;
      else if (lower.includes('research') || lower.includes('report') || lower.includes('analyze')) response = responses.research;

      const agentMsg: AgentMessage = { id: Date.now() + 1, role: 'agent', content: response, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, agentMsg]);
      setProcessing(false);
    }, 1000);
  };

  return (
    <div className="base-view" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="base-header"><h2>🧠 Agent Tab</h2></div>
      <div className="ai-messages" style={{ flex: 1, overflow: 'auto', padding: '16px 0' }}>
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role === 'user' ? 'user' : ''}`}>
            <div className="message-avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
            <div className="message-content">
              <div className="message-bubble" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        {processing && (
          <div className="typing-indicator" style={{ marginLeft: '40px' }}>
            <span /><span /><span />
          </div>
        )}
      </div>
      <div className="ai-input-area">
        <div className="ai-input-wrapper">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the agent to scrape, write, research, code, or build lists..." onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(); }} />
          <button className="send-btn" onClick={handleSend} disabled={processing || !input.trim()}>➤</button>
        </div>
      </div>
    </div>
  );
};
export default AgentTab;
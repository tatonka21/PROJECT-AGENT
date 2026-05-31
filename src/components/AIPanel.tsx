// ============================================================
// AI Panel (Toolbar Agent) — Shared conversation with main Agent
// Uses the same UnifiedAgent engine, memory, and tools
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { getSharedMessages, addSharedMessage, subscribeToMessages, processWithAgent, clearSharedMessages, type AgentMessage } from './UnifiedAgent';

const AIPanel: React.FC = () => {
  const [messages, setMessages] = useState<AgentMessage[]>(getSharedMessages());
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const unsub = subscribeToMessages(() => {
      setMessages([...getSharedMessages()]);
    });
    return unsub;
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || processing) return;

    const userMsg: AgentMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    addSharedMessage(userMsg);
    setInput('');
    setProcessing(true);

    try {
      await processWithAgent(input);
    } catch (e) {
      const errorMsg: AgentMessage = {
        id: Date.now() + 1,
        role: 'system',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };
      addSharedMessage(errorMsg);
    }
    setProcessing(false);
  }, [input, processing]);

  return (
    <div className="panel ai-panel">
      <div className="panel-header">
        <h2>
          <span className="ai-badge">AI</span>
          Agent Assistant
        </h2>
        <button className="btn-icon" title="Clear conversation" onClick={clearSharedMessages}>🗑️</button>
      </div>

      <div className="ai-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role === 'user' ? 'user' : ''}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-bubble">{msg.content}</div>
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {processing && (
          <div className="message ai">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="ai-input-area">
        <div className="ai-input-wrapper">
          <input
            type="text"
            placeholder="Ask the AI agent anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={processing}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!input.trim() || processing}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
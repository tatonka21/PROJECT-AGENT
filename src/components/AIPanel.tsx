import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/ollama';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI project assistant. I can help you manage projects, create tasks, generate reports, and more. What would you like to do?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMsg: Message = {
      id: messages.length + 1,
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const chatMessages = messages
        .filter((m) => m.sender !== 'ai' || m.id === 1)
        .map((m) => ({
          role: m.sender === 'ai' ? 'assistant' : 'user',
          content: m.text,
        }));

      chatMessages.push({ role: 'user', content: messageText });

      const response = await sendChatMessage(chatMessages);

      const aiMsg: Message = {
        id: messages.length + 2,
        text: response,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: messages.length + 2,
        text: 'An error occurred while processing your request. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="panel ai-panel">
      <div className="panel-header">
        <h2>
          <span className="ai-badge">AI</span>
          Agent Assistant
        </h2>
        <button className="btn-icon" title="Settings">⚙️</button>
      </div>

      <div className="ai-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="message-avatar">
              {msg.sender === 'ai' ? '🤖' : '👤'}
            </div>
            <div className="message-content">
              <div className="message-bubble">{msg.text}</div>
              <span className="message-time">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message ai">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-input-area">
        <div className="ai-input-wrapper">
          <input
            type="text"
            placeholder="Ask the AI agent anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            className="send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
import React, { useState } from 'react';
import type { Message } from '../types';
import { getMessages, addMessage } from '../services/store';

const MessagingView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(getMessages());
  const [input, setInput] = useState('');
  const [channel, setChannel] = useState('general');

  const refresh = () => setMessages(getMessages());

  const handleSend = () => {
    if (!input.trim()) return;
    addMessage({ sender: 'You', content: input.trim(), channel, pinned: false });
    setInput('');
    refresh();
  };

  const channels = ['general', 'design', 'development', 'random'];

  return (
    <div className="messaging-view">
      <div className="messaging-sidebar">
        <h3>Channels</h3>
        {channels.map((ch) => (
          <button key={ch} className={`channel-btn ${channel === ch ? 'active' : ''}`} onClick={() => setChannel(ch)}>
            # {ch}
          </button>
        ))}
      </div>
      <div className="messaging-main">
        <div className="messaging-header">
          <h2># {channel}</h2>
        </div>
        <div className="messaging-messages">
          {messages.filter((m) => m.channel === channel).map((msg) => (
            <div key={msg.id} className={`msg-item ${msg.pinned ? 'pinned' : ''}`}>
              <div className="msg-avatar">{msg.sender.charAt(0)}</div>
              <div className="msg-content">
                <div className="msg-sender-row">
                  <strong>{msg.sender}</strong>
                  <span className="msg-time">{new Date(msg.timestamp).toLocaleString()}</span>
                  {msg.pinned && <span className="msg-pin-badge">📌</span>}
                </div>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="messaging-input-area">
          <div className="messaging-input-wrapper">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={`Message #${channel}...`} />
            <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>➤</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingView;
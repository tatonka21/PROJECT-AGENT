import React from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/store';

interface NotificationPanelProps {
  onClose: () => void;
  onRefresh: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose, onRefresh }) => {
  const notifications = getNotifications();

  const handleMarkRead = (id: number) => {
    markNotificationRead(id);
    onRefresh();
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    onRefresh();
  };

  return (
    <div className="notification-panel">
      <div className="notification-panel-header">
        <h3>Notifications</h3>
        <div className="notification-panel-actions">
          <button className="btn-sm btn-secondary" onClick={handleMarkAllRead}>Mark all read</button>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
      </div>
      <div className="notification-list">
        {notifications.length === 0 && <div className="empty-state">No notifications</div>}
        {notifications.map((n) => (
          <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`} onClick={() => handleMarkRead(n.id)}>
            <span className="notification-icon">{TYPE_ICONS[n.type]}</span>
            <div className="notification-content">
              <strong>{n.title}</strong>
              <p>{n.message}</p>
              <span className="notification-time">{new Date(n.timestamp).toLocaleString()}</span>
            </div>
            {!n.read && <span className="unread-dot" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;
/**
 * Notification Card Component
 * Tek bir bildirimi render eder
 */

import React from 'react';

const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
  const getIcon = (type) => {
    const icons = {
      application_status: '📋',
      interview_scheduled: '📅',
      job_match: '💼',
      message: '💬',
      system: '⚙️',
      reminder: '⏰',
    };
    return icons[type] || '📢';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR');
  };

  return (
    <div
      className={`notification-card ${
        !notification.isRead ? 'unread' : ''
      } flex items-start gap-3 p-4 bg-white shadow rounded cursor-pointer hover:bg-gray-50`}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      <div className="text-2xl">{getIcon(notification.type)}</div>

      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">{notification.title}</h4>
          <span className="text-xs text-gray-500">
            {formatDate(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-600">{notification.message}</p>
        {notification.actionUrl && (
          <a
            href={notification.actionUrl}
            className="text-blue-600 text-sm mt-1 inline-block"
            onClick={(e) => e.stopPropagation()}
          >
            {notification.actionText || 'Görüntüle'}
          </a>
        )}
      </div>

      {!notification.isRead && (
        <div className="unread-indicator">
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
        </div>
      )}

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="text-red-500 hover:text-red-700 p-1"
          title="Bildirimi sil"
        >
          🗑️
        </button>
      )}
    </div>
  );
};

export default NotificationCard;

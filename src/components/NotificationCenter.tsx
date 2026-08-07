import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#18181b] w-full max-w-md h-full shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-base">
              <i className="fas fa-bell"></i>
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Notification Center</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up!'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-xs cursor-pointer"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Filter bar & Mark all read */}
        <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-amber-500 text-gray-950 font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                filter === 'unread'
                  ? 'bg-amber-500 text-gray-950 font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <i className="fas fa-bell-slash text-3xl mb-2 text-zinc-400"></i>
              <p className="font-bold text-xs text-gray-600 dark:text-gray-300">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const notifId = item._id || item.id || '';
              return (
                <div
                  key={notifId}
                  onClick={() => !item.isRead && onMarkRead(notifId)}
                  className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                    !item.isRead
                      ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30'
                      : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-4 right-4"></span>
                  )}

                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                        item.type === 'booking'
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                          : item.type === 'payment'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : item.type === 'refund'
                          ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
                          : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}
                    >
                      <i
                        className={`fas ${
                          item.type === 'booking'
                            ? 'fa-calendar-check'
                            : item.type === 'payment'
                            ? 'fa-receipt'
                            : item.type === 'refund'
                            ? 'fa-undo'
                            : 'fa-envelope'
                        }`}
                      ></i>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white">{item.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">{item.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">
                        {new Date(item.createdAt || Date.now()).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <p className="text-[10px] text-gray-400">
            CookMantra Automated Notification System • Emails sent to your registered account
          </p>
        </div>
      </div>
    </div>
  );
};

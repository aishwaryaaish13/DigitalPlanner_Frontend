import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, X, CheckCheck } from 'lucide-react';
import { Card } from './Card.jsx';
import { useNotifications } from '../../hooks/useNotifications.js';

export const NotificationPanel = ({ isOpen, onClose, buttonRef }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const getTypeColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'achievement':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'reminder':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'info':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 top-16 z-50 w-96 max-w-[calc(100vw-2rem)]"
          >
            <Card className="shadow-2xl border-2">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    <h3 className="font-semibold text-lg">Notifications</h3>
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full"
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </div>
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Actions */}
                {notifications.length > 0 && (
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <motion.button
                        onClick={markAllAsRead}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <CheckCheck className="w-3 h-3" />
                        Mark all read
                      </motion.button>
                    )}
                    <motion.button
                      onClick={clearAll}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear all
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 text-center"
                  >
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                      <Bell className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No notifications yet
                    </p>
                  </motion.div>
                ) : (
                  <div className="divide-y divide-border">
                    <AnimatePresence>
                      {notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 hover:bg-muted/50 transition-colors group ${
                            !notification.read ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* Type Indicator */}
                            <div
                              className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                !notification.read
                                  ? 'bg-primary'
                                  : 'bg-muted-foreground/30'
                              }`}
                            />

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4
                                  className={`text-sm font-semibold ${
                                    !notification.read
                                      ? 'text-foreground'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {notification.title}
                                </h4>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded ${getTypeColor(
                                    notification.type
                                  )}`}
                                >
                                  {notification.type}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {notification.time}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {!notification.read && (
                                    <motion.button
                                      onClick={() =>
                                        markAsRead(notification.id)
                                      }
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="p-1 hover:bg-primary/10 rounded text-primary"
                                      title="Mark as read"
                                    >
                                      <Check className="w-3 h-3" />
                                    </motion.button>
                                  )}
                                  <motion.button
                                    onClick={() =>
                                      deleteNotification(notification.id)
                                    }
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-1 hover:bg-destructive/10 rounded text-destructive"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

import { createContext, useState, useCallback, useEffect } from 'react';
import { websocketService } from '../services/websocketService.js';
import api from '../services/api.js';

const NotificationContext = createContext();

export { NotificationContext };

export const NotificationContextProvider = ({ children }) => {
  // Load notifications from localStorage initially
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize notifications from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
    setIsInitialized(true);
  }, []);

  // Fetch notifications from backend on mount
  useEffect(() => {
    if (isInitialized) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  // Setup WebSocket connection
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return;

    try {
      const { token } = JSON.parse(userInfo);
      
      // Connect to WebSocket (will fail silently if backend is down)
      try {
        websocketService.connect(token);
        setIsConnected(true);
      } catch (wsError) {
        console.warn('WebSocket connection failed, continuing without real-time updates');
        setIsConnected(false);
      }

      // Listen for real-time notifications
      const handleNotification = (data) => {
        console.log('Real-time notification received:', data);
        const newNotification = {
          id: data.id || Date.now().toString(),
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          read: false,
          timestamp: data.created_at || Date.now(),
          time: 'Just now',
        };
        setNotifications((prev) => {
          // Prevent duplicates
          if (prev.some(n => n.id === newNotification.id)) {
            return prev;
          }
          return [newNotification, ...prev].slice(0, 50);
        });
      };

      websocketService.on('notification', handleNotification);

      // Cleanup on unmount
      return () => {
        websocketService.off('notification', handleNotification);
        websocketService.disconnect();
        setIsConnected(false);
      };
    } catch (error) {
      console.warn('Failed to setup WebSocket, continuing without real-time updates');
      setIsConnected(false);
    }
  }, []); // Empty dependency array - only run once

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications to localStorage:', error);
    }
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications?limit=50');
      const backendNotifications = response.data.notifications || [];
      
      // Transform backend notifications to frontend format
      const formattedNotifications = backendNotifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type || 'info',
        read: n.is_read,
        timestamp: new Date(n.created_at).getTime(),
        time: getRelativeTime(n.created_at),
      }));
      
      setNotifications(formattedNotifications);
    } catch (error) {
      // Silently fail if backend is not available
      console.warn('Backend not available, using local notifications only');
      // Don't update state on error to prevent loops
    }
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
      time: 'Just now',
      ...notification,
    };
    setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Still update locally even if backend fails
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      // Still update locally even if backend fails
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }, []);

  const deleteNotification = useCallback(async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Still update locally even if backend fails
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      // Delete all notifications from backend
      await Promise.all(
        notifications.map(n => api.delete(`/notifications/${n.id}`).catch(() => {}))
      );
      setNotifications([]);
      localStorage.removeItem('notifications');
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      // Still clear locally
      setNotifications([]);
      localStorage.removeItem('notifications');
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

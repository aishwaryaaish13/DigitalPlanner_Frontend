// Helper functions for creating notifications

export const createNotification = {
  success: (title, message) => ({
    title,
    message,
    type: 'success',
    time: 'Just now',
  }),

  error: (title, message) => ({
    title,
    message,
    type: 'error',
    time: 'Just now',
  }),

  info: (title, message) => ({
    title,
    message,
    type: 'info',
    time: 'Just now',
  }),

  reminder: (title, message) => ({
    title,
    message,
    type: 'reminder',
    time: 'Just now',
  }),

  achievement: (title, message) => ({
    title,
    message,
    type: 'achievement',
    time: 'Just now',
  }),
};

// Example usage in components:
// const { addNotification } = useNotifications();
// addNotification(createNotification.success('Task Completed', 'You finished your task!'));

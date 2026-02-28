import api from './api.js';

export const productivityService = {
  // Get user's productivity data
  getProductivity: async () => {
    const response = await api.get('/productivity');
    return response.data;
  },

  // Initialize productivity data for new user
  initializeProductivity: async () => {
    const response = await api.post('/productivity/initialize');
    return response.data;
  },

  // Task completion tracking
  incrementTask: async (date) => {
    const response = await api.post('/productivity/task-complete', { date });
    return response.data;
  },

  decrementTask: async (date) => {
    const response = await api.post('/productivity/task-uncomplete', { date });
    return response.data;
  },

  // Goal tracking
  incrementGoal: async () => {
    const response = await api.post('/productivity/goal-complete');
    return response.data;
  },

  setTotalGoals: async (count) => {
    const response = await api.put('/productivity/total-goals', { count });
    return response.data;
  },

  // Focus session tracking
  incrementFocusSession: async () => {
    const response = await api.post('/productivity/focus-complete');
    return response.data;
  },

  // Badge tracking
  unlockBadge: async (badgeId) => {
    const response = await api.post('/productivity/unlock-badge', { badgeId });
    return response.data;
  },
};

import api from './api.js';

export const goalService = {
  getGoals: async (filters = {}) => {
    const response = await api.get('/goals', { params: filters });
    const goals = Array.isArray(response.data) ? response.data : (response.data.goals || []);
    return goals.map(goal => ({
      ...goal,
      id: goal.id || goal.goal_id
    }));
  },

  getGoalById: async (id) => {
    const response = await api.get(`/goals/${id}`);
    const goal = response.data.goal || response.data;
    return {
      ...goal,
      id: goal.id || goal.goal_id
    };
  },

  createGoal: async (goalData) => {
    const response = await api.post('/goals', goalData);
    const goal = response.data.goal || response.data;
    return {
      ...goal,
      id: goal.id || goal.goal_id
    };
  },

  updateGoal: async (id, goalData) => {
    const response = await api.put(`/goals/${id}`, goalData);
    const goal = response.data.goal || response.data;
    return {
      ...goal,
      id: goal.id || goal.goal_id
    };
  },

  deleteGoal: async (id) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },

  updateProgress: async (id, progress) => {
    const response = await api.patch(`/goals/${id}/progress`, { progress });
    const goal = response.data.goal || response.data;
    return {
      ...goal,
      id: goal.id || goal.goal_id
    };
  },

  completeGoal: async (id) => {
    const response = await api.patch(`/goals/${id}/complete`, {});
    const goal = response.data.goal || response.data;
    return {
      ...goal,
      id: goal.id || goal.goal_id
    };
  },
};

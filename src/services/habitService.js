import api from './api.js';

export const habitService = {
  getHabits: async () => {
    const response = await api.get('/habits');
    const habits = Array.isArray(response.data) ? response.data : (response.data.habits || []);
    return habits.map(habit => ({
      ...habit,
      id: habit.id || habit.habit_id,
      completedToday: habit.completed_today || false,
      streak: habit.streak || 0,
    }));
  },

  getHabitById: async (id) => {
    const response = await api.get(`/habits/${id}`);
    const habit = response.data.habit || response.data;
    return {
      ...habit,
      id: habit.id || habit.habit_id
    };
  },

  createHabit: async (habitData) => {
    const response = await api.post('/habits', habitData);
    const habit = response.data.habit || response.data;
    return {
      ...habit,
      id: habit.id || habit.habit_id,
      completedToday: habit.completed_today || false,
      streak: habit.streak || 0,
    };
  },

  updateHabit: async (id, habitData) => {
    const response = await api.put(`/habits/${id}`, habitData);
    const habit = response.data.habit || response.data;
    return {
      ...habit,
      id: habit.id || habit.habit_id,
      // Ensure these fields are included in the response
      completed_today: habit.completed_today,
      streak: habit.streak || 0,
    };
  },

  deleteHabit: async (id) => {
    const response = await api.delete(`/habits/${id}`);
    return response.data;
  },

  markComplete: async (id, date = new Date().toISOString().split('T')[0]) => {
    const response = await api.post(`/habits/${id}/complete`, { date });
    const habit = response.data.habit || response.data;
    return {
      ...habit,
      id: habit.id || habit.habit_id
    };
  },

  getStreak: async (id) => {
    const response = await api.get(`/habits/${id}/streak`);
    return response.data;
  },
};

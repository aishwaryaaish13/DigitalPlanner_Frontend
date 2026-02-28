import api from './api.js';

export const aiService = {
  improveJournal: async (text) => {
    const response = await api.post('/ai/analyze', {
      type: 'journal_improvement',
      text,
    });
    return response.data;
  },

  breakdownTask: async (taskDescription) => {
    const response = await api.post('/ai/analyze', {
      type: 'task_breakdown',
      text: taskDescription,
    });
    return response.data;
  },

  analyzeMood: async (moodData) => {
    const response = await api.post('/ai/analyze', {
      type: 'mood_analysis',
      data: moodData,
    });
    return response.data;
  },

  generateMotivation: async (goalData) => {
    const response = await api.post('/ai/analyze', {
      type: 'goal_motivation',
      data: goalData,
    });
    return response.data;
  },
};

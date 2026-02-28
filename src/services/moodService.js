import api from './api.js';

export const moodService = {
  getMoods: async (filters = {}) => {
    const response = await api.get('/moods', { params: filters });
    console.log('Raw mood response:', response.data);
    // Backend returns moodLogs array
    const moods = Array.isArray(response.data) ? response.data : (response.data.moodLogs || response.data.moods || []);
    console.log('Processed moods:', moods);
    return moods.map(mood => ({
      ...mood,
      id: mood.id || mood.mood_id
    }));
  },

  logMood: async (moodData) => {
    console.log('Sending mood data to backend:', moodData);
    const response = await api.post('/moods', moodData);
    console.log('Log mood response:', response.data);
    // Backend returns moodLog object
    const mood = response.data.moodLog || response.data.mood || response.data;
    return {
      ...mood,
      id: mood.id || mood.mood_id
    };
  },

  updateMood: async (id, moodData) => {
    const response = await api.put(`/moods/${id}`, moodData);
    const mood = response.data.moodLog || response.data.mood || response.data;
    return {
      ...mood,
      id: mood.id || mood.mood_id
    };
  },

  deleteMood: async (id) => {
    const response = await api.delete(`/moods/${id}`);
    return response.data;
  },

  getTrends: async (days = 30) => {
    const response = await api.get(`/moods/trends?days=${days}`);
    return response.data;
  },

  getMoodAnalysis: async () => {
    const response = await api.get('/moods/analysis');
    return response.data;
  },
};

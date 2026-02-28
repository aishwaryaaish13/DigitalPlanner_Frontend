import api from './api.js';

export const journalService = {
  getEntries: async (filters = {}) => {
    const response = await api.get('/journal', { params: filters });
    // Handle both array response and object with entries property
    const entries = Array.isArray(response.data) ? response.data : (response.data.entries || response.data.journals || []);
    // Normalize entry_id or journal_id to id for frontend consistency
    return entries.map(entry => ({
      ...entry,
      id: entry.id || entry.entry_id || entry.journal_id
    }));
  },

  getEntryById: async (id) => {
    const response = await api.get(`/journal/${id}`);
    const entry = response.data.entry || response.data.journal || response.data;
    return {
      ...entry,
      id: entry.id || entry.entry_id || entry.journal_id
    };
  },

  createEntry: async (entryData) => {
    console.log('Creating entry with data:', entryData);
    // Only send content and mood to backend
    const backendData = {
      content: entryData.content,
      mood: entryData.mood
    };
    console.log('Sending to backend:', backendData);
    const response = await api.post('/journal', backendData);
    console.log('Create response:', response.data);
    const entry = response.data.entry || response.data.journal || response.data;
    return {
      ...entry,
      id: entry.id || entry.entry_id || entry.journal_id
    };
  },

  updateEntry: async (id, entryData) => {
    console.log('journalService.updateEntry called with:', { id, entryData });
    // Only send content and mood to backend
    const backendData = {
      content: entryData.content,
      mood: entryData.mood
    };
    console.log('Sending to backend:', backendData);
    const response = await api.put(`/journal/${id}`, backendData);
    console.log('Update response from backend:', response.data);
    const entry = response.data.entry || response.data.journal || response.data;
    const processedEntry = {
      ...entry,
      id: entry.id || entry.entry_id || entry.journal_id
    };
    console.log('Processed updated entry:', processedEntry);
    return processedEntry;
  },

  deleteEntry: async (id) => {
    const response = await api.delete(`/journal/${id}`);
    return response.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/journal/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

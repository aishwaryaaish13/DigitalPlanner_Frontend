import api from './api.js';

export const authService = {
  register: async (email, password, name) => {
    const response = await api.post('/auth/register', { email, password, name });
    if (response.data.token && response.data.user) {
      localStorage.setItem('userInfo', JSON.stringify({
        token: response.data.token,
        user: response.data.user
      }));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token && response.data.user) {
      localStorage.setItem('userInfo', JSON.stringify({
        token: response.data.token,
        user: response.data.user
      }));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('userInfo');
  },

  getCurrentUser: () => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const { user } = JSON.parse(userInfo);
        return user;
      } catch (error) {
        console.error('Error parsing userInfo:', error);
        localStorage.removeItem('userInfo');
        return null;
      }
    }
    return null;
  },

  isAuthenticated: () => {
    const userInfo = localStorage.getItem('userInfo');
    return !!userInfo;
  },

  updateUser: (userData) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        parsed.user = { ...parsed.user, ...userData };
        localStorage.setItem('userInfo', JSON.stringify(parsed));
        return parsed.user;
      } catch (error) {
        console.error('Error updating user:', error);
        return null;
      }
    }
    return null;
  },
};

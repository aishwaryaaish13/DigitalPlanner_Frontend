import api from './api.js';

export const authService = {
  // Token expiration time (24 hours in milliseconds)
  TOKEN_EXPIRATION_TIME: 24 * 60 * 60 * 1000,

  register: async (email, password, name) => {
    const response = await api.post('/auth/register', { email, password, name });
    if (response.data.token && response.data.user) {
      const expiresAt = Date.now() + authService.TOKEN_EXPIRATION_TIME;
      localStorage.setItem('userInfo', JSON.stringify({
        token: response.data.token,
        user: response.data.user,
        expiresAt
      }));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token && response.data.user) {
      const expiresAt = Date.now() + authService.TOKEN_EXPIRATION_TIME;
      localStorage.setItem('userInfo', JSON.stringify({
        token: response.data.token,
        user: response.data.user,
        expiresAt
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
        const { user, expiresAt } = JSON.parse(userInfo);
        
        // Check if token has expired
        if (expiresAt && Date.now() > expiresAt) {
          console.log('Token expired, logging out...');
          authService.logout();
          return null;
        }
        
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
    if (!userInfo) return false;

    try {
      const { expiresAt } = JSON.parse(userInfo);
      
      // Check if token has expired
      if (expiresAt && Date.now() > expiresAt) {
        authService.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  getTokenExpirationTime: () => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const { expiresAt } = JSON.parse(userInfo);
        return expiresAt;
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  isTokenExpiringSoon: (minutesThreshold = 30) => {
    const expiresAt = authService.getTokenExpirationTime();
    if (!expiresAt) return false;
    
    const timeUntilExpiry = expiresAt - Date.now();
    const thresholdMs = minutesThreshold * 60 * 1000;
    
    return timeUntilExpiry > 0 && timeUntilExpiry < thresholdMs;
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

  refreshToken: async () => {
    try {
      // If your backend supports token refresh, implement it here
      // const response = await api.post('/auth/refresh');
      // if (response.data.token) {
      //   const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      //   userInfo.token = response.data.token;
      //   userInfo.expiresAt = Date.now() + authService.TOKEN_EXPIRATION_TIME;
      //   localStorage.setItem('userInfo', JSON.stringify(userInfo));
      //   return true;
      // }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  },
};

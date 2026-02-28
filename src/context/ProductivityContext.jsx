import React, { createContext, useState, useContext, useEffect } from 'react';
import { productivityService } from '../services/productivityService.js';
import { useAuth } from '../hooks/useAuth.js';

const ProductivityContext = createContext();

export const useProductivity = () => {
  const context = useContext(ProductivityContext);
  if (!context) {
    throw new Error('useProductivity must be used within ProductivityProvider');
  }
  return context;
};

export const ProductivityProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [productivityData, setProductivityData] = useState({
    completedDays: [],
    productivityData: {},
    tasksCompleted: 0,
    goalsCompleted: 0,
    totalGoals: 0,
    focusSessions: 0,
    unlockedBadges: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load productivity data when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      loadProductivityData();
    } else {
      // Clear data when logged out
      setProductivityData({
        completedDays: [],
        productivityData: {},
        tasksCompleted: 0,
        goalsCompleted: 0,
        totalGoals: 0,
        focusSessions: 0,
        unlockedBadges: [],
      });
    }
  }, [isAuthenticated, user]);

  const loadProductivityData = async () => {
    try {
      setIsLoading(true);
      const data = await productivityService.getProductivity();
      
      // Parse JSON fields
      const parsedData = {
        completedDays: data.completed_days || [],
        productivityData: data.productivity_data || {},
        tasksCompleted: data.tasks_completed || 0,
        goalsCompleted: data.goals_completed || 0,
        totalGoals: data.total_goals || 0,
        focusSessions: data.focus_sessions || 0,
        unlockedBadges: data.unlocked_badges || [],
      };
      
      setProductivityData(parsedData);
      
      // Also update localStorage for offline access
      localStorage.setItem('completedDays', JSON.stringify(parsedData.completedDays));
      localStorage.setItem('productivityData', JSON.stringify(parsedData.productivityData));
      localStorage.setItem('tasksCompleted', parsedData.tasksCompleted.toString());
      localStorage.setItem('goalsCompleted', parsedData.goalsCompleted.toString());
      localStorage.setItem('totalGoals', parsedData.totalGoals.toString());
      localStorage.setItem('focusSessions', parsedData.focusSessions.toString());
      localStorage.setItem('unlockedBadges', JSON.stringify(parsedData.unlockedBadges));
      
      // Trigger update event for components
      window.dispatchEvent(new Event('productivityUpdate'));
    } catch (error) {
      console.error('Error loading productivity data:', error);
      // If error (like 404), initialize new data
      if (error.response?.status === 404) {
        try {
          console.log('Productivity record not found, initializing...');
          await productivityService.initializeProductivity();
          // Retry loading after initialization
          const retryData = await productivityService.getProductivity();
          
          const parsedData = {
            completedDays: retryData.completed_days || [],
            productivityData: retryData.productivity_data || {},
            tasksCompleted: retryData.tasks_completed || 0,
            goalsCompleted: retryData.goals_completed || 0,
            totalGoals: retryData.total_goals || 0,
            focusSessions: retryData.focus_sessions || 0,
            unlockedBadges: retryData.unlocked_badges || [],
          };
          
          setProductivityData(parsedData);
          
          // Update localStorage
          localStorage.setItem('completedDays', JSON.stringify(parsedData.completedDays));
          localStorage.setItem('productivityData', JSON.stringify(parsedData.productivityData));
          localStorage.setItem('tasksCompleted', parsedData.tasksCompleted.toString());
          localStorage.setItem('goalsCompleted', parsedData.goalsCompleted.toString());
          localStorage.setItem('totalGoals', parsedData.totalGoals.toString());
          localStorage.setItem('focusSessions', parsedData.focusSessions.toString());
          localStorage.setItem('unlockedBadges', JSON.stringify(parsedData.unlockedBadges));
          
          // Trigger update event
          window.dispatchEvent(new Event('productivityUpdate'));
        } catch (initError) {
          console.error('Error initializing productivity:', initError);
          // Set default empty data to prevent components from breaking
          const defaultData = {
            completedDays: [],
            productivityData: {},
            tasksCompleted: 0,
            goalsCompleted: 0,
            totalGoals: 0,
            focusSessions: 0,
            unlockedBadges: [],
          };
          setProductivityData(defaultData);
          localStorage.setItem('completedDays', JSON.stringify(defaultData.completedDays));
          localStorage.setItem('productivityData', JSON.stringify(defaultData.productivityData));
          localStorage.setItem('tasksCompleted', '0');
          localStorage.setItem('goalsCompleted', '0');
          localStorage.setItem('totalGoals', '0');
          localStorage.setItem('focusSessions', '0');
          localStorage.setItem('unlockedBadges', JSON.stringify(defaultData.unlockedBadges));
        }
      } else {
        // For other errors, set default data
        const defaultData = {
          completedDays: [],
          productivityData: {},
          tasksCompleted: 0,
          goalsCompleted: 0,
          totalGoals: 0,
          focusSessions: 0,
          unlockedBadges: [],
        };
        setProductivityData(defaultData);
        localStorage.setItem('completedDays', JSON.stringify(defaultData.completedDays));
        localStorage.setItem('productivityData', JSON.stringify(defaultData.productivityData));
        localStorage.setItem('tasksCompleted', '0');
        localStorage.setItem('goalsCompleted', '0');
        localStorage.setItem('totalGoals', '0');
        localStorage.setItem('focusSessions', '0');
        localStorage.setItem('unlockedBadges', JSON.stringify(defaultData.unlockedBadges));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const incrementTask = async (date) => {
    try {
      const data = await productivityService.incrementTask(date);
      await loadProductivityData(); // Reload to sync
      window.dispatchEvent(new Event('productivityUpdate'));
      return data;
    } catch (error) {
      console.error('Error incrementing task:', error);
      
      // If 404, try to initialize and retry
      if (error.response?.status === 404) {
        try {
          console.log('Productivity record not found, initializing...');
          await productivityService.initializeProductivity();
          // Retry the increment
          const data = await productivityService.incrementTask(date);
          await loadProductivityData();
          window.dispatchEvent(new Event('productivityUpdate'));
          return data;
        } catch (retryError) {
          console.error('Error after initialization:', retryError);
          throw retryError;
        }
      }
      throw error;
    }
  };

  const decrementTask = async (date) => {
    try {
      const data = await productivityService.decrementTask(date);
      await loadProductivityData();
      window.dispatchEvent(new Event('productivityUpdate'));
      return data;
    } catch (error) {
      console.error('Error decrementing task:', error);
      throw error;
    }
  };

  const incrementGoal = async () => {
    try {
      const data = await productivityService.incrementGoal();
      await loadProductivityData();
      window.dispatchEvent(new Event('productivityUpdate'));
      return data;
    } catch (error) {
      console.error('Error incrementing goal:', error);
      
      // If 404, try to initialize and retry
      if (error.response?.status === 404) {
        try {
          await productivityService.initializeProductivity();
          const data = await productivityService.incrementGoal();
          await loadProductivityData();
          window.dispatchEvent(new Event('productivityUpdate'));
          return data;
        } catch (retryError) {
          console.error('Error after initialization:', retryError);
          throw retryError;
        }
      }
      throw error;
    }
  };

  const setTotalGoals = async (count) => {
    try {
      const data = await productivityService.setTotalGoals(count);
      await loadProductivityData();
      window.dispatchEvent(new Event('productivityUpdate'));
      return data;
    } catch (error) {
      console.error('Error setting total goals:', error);
      
      // If 404, try to initialize and retry
      if (error.response?.status === 404) {
        try {
          await productivityService.initializeProductivity();
          const data = await productivityService.setTotalGoals(count);
          await loadProductivityData();
          window.dispatchEvent(new Event('productivityUpdate'));
          return data;
        } catch (retryError) {
          console.error('Error after initialization:', retryError);
          throw retryError;
        }
      }
      throw error;
    }
  };

  const incrementFocusSession = async () => {
    try {
      const data = await productivityService.incrementFocusSession();
      await loadProductivityData();
      window.dispatchEvent(new Event('productivityUpdate'));
      return data;
    } catch (error) {
      console.error('Error incrementing focus session:', error);
      
      // If 404, try to initialize and retry
      if (error.response?.status === 404) {
        try {
          await productivityService.initializeProductivity();
          const data = await productivityService.incrementFocusSession();
          await loadProductivityData();
          window.dispatchEvent(new Event('productivityUpdate'));
          return data;
        } catch (retryError) {
          console.error('Error after initialization:', retryError);
          throw retryError;
        }
      }
      throw error;
    }
  };

  const unlockBadge = async (badgeId) => {
    try {
      const data = await productivityService.unlockBadge(badgeId);
      await loadProductivityData();
      window.dispatchEvent(new Event('productivityUpdate'));
      return data;
    } catch (error) {
      console.error('Error unlocking badge:', error);
      throw error;
    }
  };

  const value = {
    productivityData,
    isLoading,
    loadProductivityData,
    incrementTask,
    decrementTask,
    incrementGoal,
    setTotalGoals,
    incrementFocusSession,
    unlockBadge,
  };

  return (
    <ProductivityContext.Provider value={value}>
      {children}
    </ProductivityContext.Provider>
  );
};

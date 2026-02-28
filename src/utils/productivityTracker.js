// Productivity Tracker Utility
// Tracks user activity for analytics components

const triggerUpdate = () => {
  window.dispatchEvent(new Event('productivityUpdate'));
};

export const productivityTracker = {
  // Mark today as a completed day (for streak tracking)
  markDayComplete: () => {
    const today = new Date().toISOString().split('T')[0];
    const completedDays = JSON.parse(localStorage.getItem('completedDays') || '[]');
    
    if (!completedDays.includes(today)) {
      completedDays.push(today);
      localStorage.setItem('completedDays', JSON.stringify(completedDays));
      triggerUpdate();
    }
  },

  // Increment task count for today (for heatmap and analytics)
  incrementTaskCount: () => {
    const today = new Date().toISOString().split('T')[0];
    const productivityData = JSON.parse(localStorage.getItem('productivityData') || '{}');
    
    productivityData[today] = (productivityData[today] || 0) + 1;
    localStorage.setItem('productivityData', JSON.stringify(productivityData));
    
    // Also increment total tasks completed
    const tasksCompleted = parseInt(localStorage.getItem('tasksCompleted') || '0');
    localStorage.setItem('tasksCompleted', (tasksCompleted + 1).toString());
    
    // Mark day as complete for streak
    productivityTracker.markDayComplete();
    triggerUpdate();
  },

  // Decrement task count (when task is uncompleted)
  decrementTaskCount: () => {
    const today = new Date().toISOString().split('T')[0];
    const productivityData = JSON.parse(localStorage.getItem('productivityData') || '{}');
    
    if (productivityData[today] && productivityData[today] > 0) {
      productivityData[today] -= 1;
      localStorage.setItem('productivityData', JSON.stringify(productivityData));
    }
    
    // Also decrement total tasks completed
    const tasksCompleted = parseInt(localStorage.getItem('tasksCompleted') || '0');
    if (tasksCompleted > 0) {
      localStorage.setItem('tasksCompleted', (tasksCompleted - 1).toString());
    }
    triggerUpdate();
  },

  // Increment goal completion count
  incrementGoalCount: () => {
    const goalsCompleted = parseInt(localStorage.getItem('goalsCompleted') || '0');
    localStorage.setItem('goalsCompleted', (goalsCompleted + 1).toString());
    triggerUpdate();
  },

  // Check if goal is completed (100% progress)
  checkGoalCompletion: (currentValue, targetValue) => {
    return currentValue >= targetValue;
  },

  // Initialize total goals count (call once when goals are loaded)
  setTotalGoals: (count) => {
    localStorage.setItem('totalGoals', count.toString());
    triggerUpdate();
  },

  // Get all stats (for debugging)
  getStats: () => {
    return {
      tasksCompleted: parseInt(localStorage.getItem('tasksCompleted') || '0'),
      goalsCompleted: parseInt(localStorage.getItem('goalsCompleted') || '0'),
      totalGoals: parseInt(localStorage.getItem('totalGoals') || '0'),
      focusSessions: parseInt(localStorage.getItem('focusSessions') || '0'),
      completedDays: JSON.parse(localStorage.getItem('completedDays') || '[]'),
      productivityData: JSON.parse(localStorage.getItem('productivityData') || '{}'),
    };
  },
};

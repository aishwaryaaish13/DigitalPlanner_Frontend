// Utility to clear demo data from localStorage
// Run this once to reset everything

export const clearDemoData = () => {
  localStorage.removeItem('completedDays');
  localStorage.removeItem('productivityData');
  localStorage.removeItem('tasksCompleted');
  localStorage.removeItem('goalsCompleted');
  localStorage.removeItem('totalGoals');
  localStorage.removeItem('unlockedBadges');
  console.log('Demo data cleared! Refresh the page.');
};

// Auto-clear on import (run once)
if (typeof window !== 'undefined') {
  // Check if we should clear (you can remove this after first run)
  const shouldClear = !localStorage.getItem('dataCleared');
  if (shouldClear) {
    clearDemoData();
    localStorage.setItem('dataCleared', 'true');
  }
}

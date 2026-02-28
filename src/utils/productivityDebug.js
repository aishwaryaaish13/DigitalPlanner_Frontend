// Productivity Debug Utility
// Use this in browser console to debug productivity tracking issues

export const productivityDebug = {
  // Check current localStorage state
  checkLocalStorage: () => {
    console.log('=== Productivity LocalStorage State ===');
    console.log('completedDays:', localStorage.getItem('completedDays'));
    console.log('productivityData:', localStorage.getItem('productivityData'));
    console.log('tasksCompleted:', localStorage.getItem('tasksCompleted'));
    console.log('goalsCompleted:', localStorage.getItem('goalsCompleted'));
    console.log('totalGoals:', localStorage.getItem('totalGoals'));
    console.log('focusSessions:', localStorage.getItem('focusSessions'));
    console.log('unlockedBadges:', localStorage.getItem('unlockedBadges'));
    console.log('=====================================');
  },

  // Parse and display data in readable format
  showData: () => {
    console.log('=== Parsed Productivity Data ===');
    console.log('Completed Days:', JSON.parse(localStorage.getItem('completedDays') || '[]'));
    console.log('Productivity Data:', JSON.parse(localStorage.getItem('productivityData') || '{}'));
    console.log('Tasks Completed:', parseInt(localStorage.getItem('tasksCompleted') || '0'));
    console.log('Goals Completed:', parseInt(localStorage.getItem('goalsCompleted') || '0'));
    console.log('Total Goals:', parseInt(localStorage.getItem('totalGoals') || '0'));
    console.log('Focus Sessions:', parseInt(localStorage.getItem('focusSessions') || '0'));
    console.log('Unlocked Badges:', JSON.parse(localStorage.getItem('unlockedBadges') || '[]'));
    console.log('================================');
  },

  // Manually trigger a productivity update event
  triggerUpdate: () => {
    console.log('Triggering productivityUpdate event...');
    window.dispatchEvent(new Event('productivityUpdate'));
    console.log('Event triggered!');
  },

  // Add test data for debugging
  addTestData: () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const completedDays = [yesterdayStr, today];
    const productivityData = {
      [yesterdayStr]: 5,
      [today]: 3,
    };

    localStorage.setItem('completedDays', JSON.stringify(completedDays));
    localStorage.setItem('productivityData', JSON.stringify(productivityData));
    localStorage.setItem('tasksCompleted', '8');
    localStorage.setItem('goalsCompleted', '2');
    localStorage.setItem('totalGoals', '5');
    localStorage.setItem('focusSessions', '3');
    localStorage.setItem('unlockedBadges', JSON.stringify(['tasks_10']));

    console.log('Test data added!');
    productivityDebug.triggerUpdate();
  },

  // Clear all productivity data
  clearAll: () => {
    localStorage.removeItem('completedDays');
    localStorage.removeItem('productivityData');
    localStorage.removeItem('tasksCompleted');
    localStorage.removeItem('goalsCompleted');
    localStorage.removeItem('totalGoals');
    localStorage.removeItem('focusSessions');
    localStorage.removeItem('unlockedBadges');
    console.log('All productivity data cleared!');
    productivityDebug.triggerUpdate();
  },

  // Simulate completing a task
  simulateTaskComplete: () => {
    const today = new Date().toISOString().split('T')[0];
    const completedDays = JSON.parse(localStorage.getItem('completedDays') || '[]');
    const productivityData = JSON.parse(localStorage.getItem('productivityData') || '{}');
    const tasksCompleted = parseInt(localStorage.getItem('tasksCompleted') || '0');

    if (!completedDays.includes(today)) {
      completedDays.push(today);
    }
    productivityData[today] = (productivityData[today] || 0) + 1;

    localStorage.setItem('completedDays', JSON.stringify(completedDays));
    localStorage.setItem('productivityData', JSON.stringify(productivityData));
    localStorage.setItem('tasksCompleted', (tasksCompleted + 1).toString());

    console.log('Task completed! New count:', tasksCompleted + 1);
    productivityDebug.triggerUpdate();
  },
};

// Make it available globally for console debugging
if (typeof window !== 'undefined') {
  window.productivityDebug = productivityDebug;
}

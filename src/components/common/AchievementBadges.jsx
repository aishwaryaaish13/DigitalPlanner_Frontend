import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AchievementBadges() {
  const [badges, setBadges] = useState([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState(null);

  const badgeDefinitions = [
    { id: 'tasks_10', name: 'Task Master', icon: '✅', requirement: 'Complete 10 tasks', key: 'tasksCompleted', threshold: 10 },
    { id: 'streak_7', name: 'Week Warrior', icon: '🔥', requirement: 'Maintain 7-day streak', key: 'currentStreak', threshold: 7 },
    { id: 'goals_5', name: 'Goal Getter', icon: '🎯', requirement: 'Complete 5 goals', key: 'goalsCompleted', threshold: 5 },
    { id: 'focus_10', name: 'Focus Champion', icon: '🧘', requirement: 'Complete 10 focus sessions', key: 'focusSessions', threshold: 10 },
  ];

  useEffect(() => {
    checkBadges();
    
    // Listen for badge updates
    const handleBadgeUpdate = () => {
      checkBadges();
    };
    
    window.addEventListener('badgeUpdate', handleBadgeUpdate);
    window.addEventListener('streakUpdate', handleBadgeUpdate);
    window.addEventListener('productivityUpdate', handleBadgeUpdate);
    
    // Initial delay to ensure localStorage is populated
    const timer = setTimeout(() => {
      checkBadges();
    }, 500);
    
    return () => {
      window.removeEventListener('badgeUpdate', handleBadgeUpdate);
      window.removeEventListener('streakUpdate', handleBadgeUpdate);
      window.removeEventListener('productivityUpdate', handleBadgeUpdate);
      clearTimeout(timer);
    };
  }, []);

  const checkBadges = () => {
    const unlockedBadges = JSON.parse(localStorage.getItem('unlockedBadges') || '[]');
    const stats = getStats();

    const updatedBadges = badgeDefinitions.map(badge => {
      const isUnlocked = unlockedBadges.includes(badge.id) || stats[badge.key] >= badge.threshold;
      
      if (isUnlocked && !unlockedBadges.includes(badge.id)) {
        unlockedBadges.push(badge.id);
        setNewlyUnlocked(badge);
        setTimeout(() => setNewlyUnlocked(null), 3000);
      }

      return {
        ...badge,
        unlocked: isUnlocked,
        progress: Math.min(stats[badge.key], badge.threshold),
      };
    });

    localStorage.setItem('unlockedBadges', JSON.stringify(unlockedBadges));
    setBadges(updatedBadges);
  };

  const getStats = () => {
    const completedDays = JSON.parse(localStorage.getItem('completedDays') || '[]');
    const focusSessions = parseInt(localStorage.getItem('focusSessions') || '0');
    const tasksCompleted = parseInt(localStorage.getItem('tasksCompleted') || '0');
    const goalsCompleted = parseInt(localStorage.getItem('goalsCompleted') || '0');

    // Calculate current streak
    let currentStreak = 0;
    if (completedDays.length > 0) {
      const sortedDays = completedDays.map(d => new Date(d)).sort((a, b) => b - a);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const mostRecent = new Date(sortedDays[0]);
      mostRecent.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 1) {
        currentStreak = 1;
        for (let i = 1; i < sortedDays.length; i++) {
          const diff = Math.floor((sortedDays[i - 1] - sortedDays[i]) / (1000 * 60 * 60 * 24));
          if (diff === 1) currentStreak++;
          else break;
        }
      }
    }

    return { tasksCompleted, currentStreak, goalsCompleted, focusSessions };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-4xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-gray-800 dark:text-white mb-6"
      >
        🏆 Achievement Badges
      </motion.h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: badge.unlocked ? 1.05 : 1 }}
            className={`relative p-4 rounded-lg border-2 transition-all ${
              badge.unlocked
                ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-400 dark:border-yellow-600'
                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 opacity-60'
            }`}
          >
            <div className="text-center">
              <motion.div
                animate={badge.unlocked ? { rotate: [0, -10, 10, -10, 0] } : {}}
                transition={{ duration: 0.5 }}
                className={`text-5xl mb-2 ${!badge.unlocked && 'grayscale'}`}
              >
                {badge.icon}
              </motion.div>
              <h3 className="font-bold text-sm text-gray-800 dark:text-white mb-1">
                {badge.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {badge.requirement}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(badge.progress / badge.threshold) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`h-2 rounded-full ${
                    badge.unlocked ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {badge.progress}/{badge.threshold}
              </p>
            </div>
            {badge.unlocked && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                ✓
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {newlyUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-4 rounded-lg shadow-2xl z-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{newlyUnlocked.icon}</span>
              <div>
                <p className="font-bold">Badge Unlocked!</p>
                <p className="text-sm">{newlyUnlocked.name}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

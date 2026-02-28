import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function StreakTracker() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [animatedCurrent, setAnimatedCurrent] = useState(0);
  const [animatedLongest, setAnimatedLongest] = useState(0);

  useEffect(() => {
    calculateStreaks();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      calculateStreaks();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('streakUpdate', handleStorageChange);
    window.addEventListener('productivityUpdate', handleStorageChange);
    
    // Initial delay to ensure localStorage is populated
    const timer = setTimeout(() => {
      calculateStreaks();
    }, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('streakUpdate', handleStorageChange);
      window.removeEventListener('productivityUpdate', handleStorageChange);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    animateNumber(animatedCurrent, currentStreak, setAnimatedCurrent);
  }, [currentStreak]);

  useEffect(() => {
    animateNumber(animatedLongest, longestStreak, setAnimatedLongest);
  }, [longestStreak]);

  const calculateStreaks = () => {
    const completedDays = JSON.parse(localStorage.getItem('completedDays') || '[]');
    
    if (completedDays.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }
    
    calculateStreaksFromDays(completedDays);
  };

  const calculateStreaksFromDays = (days) => {
    if (days.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }

    const sortedDays = days.map(d => new Date(d)).sort((a, b) => b - a);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let current = 0;
    let longest = 0;
    let tempStreak = 0;

    // Calculate current streak
    const mostRecent = new Date(sortedDays[0]);
    mostRecent.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 1) {
      for (let i = 0; i < sortedDays.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const diff = Math.floor((sortedDays[i - 1] - sortedDays[i]) / (1000 * 60 * 60 * 24));
          if (diff === 1) {
            tempStreak++;
          } else {
            break;
          }
        }
      }
      current = tempStreak;
    }

    // Calculate longest streak
    tempStreak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const diff = Math.floor((sortedDays[i - 1] - sortedDays[i]) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        tempStreak++;
        longest = Math.max(longest, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
    longest = Math.max(longest, tempStreak, current);

    setCurrentStreak(current);
    setLongestStreak(longest);
  };

  const animateNumber = (from, to, setter) => {
    if (from === to) return;
    const duration = 1000;
    const steps = 30;
    const increment = (to - from) / steps;
    let current = from;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setter(to);
        clearInterval(timer);
      } else {
        setter(Math.round(current));
      }
    }, duration / steps);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05, rotate: 1 }}
        className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white relative overflow-hidden"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="text-4xl mb-2"
        >
          🔥
        </motion.div>
        <div className="text-sm font-medium opacity-90 mb-1">Current Streak</div>
        <motion.div
          key={animatedCurrent}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-5xl font-bold"
        >
          {animatedCurrent}
        </motion.div>
        <div className="text-sm opacity-75 mt-1">days</div>
        <motion.div
          className="absolute -right-8 -bottom-8 w-32 h-32 bg-white opacity-10 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.05, rotate: -1 }}
        className="bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl shadow-lg p-6 text-white relative overflow-hidden"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          className="text-4xl mb-2"
        >
          🏆
        </motion.div>
        <div className="text-sm font-medium opacity-90 mb-1">Longest Streak</div>
        <motion.div
          key={animatedLongest}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-5xl font-bold"
        >
          {animatedLongest}
        </motion.div>
        <div className="text-sm opacity-75 mt-1">days</div>
        <motion.div
          className="absolute -left-8 -top-8 w-32 h-32 bg-white opacity-10 rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
}

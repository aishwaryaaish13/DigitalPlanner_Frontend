import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function MiniAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    weeklyRate: 0,
    avgPerDay: 0,
    goalRate: 0,
    weeklyData: [],
  });

  useEffect(() => {
    calculateAnalytics();
    
    // Listen for updates
    const handleAnalyticsUpdate = () => {
      calculateAnalytics();
    };
    
    window.addEventListener('heatmapUpdate', handleAnalyticsUpdate);
    window.addEventListener('badgeUpdate', handleAnalyticsUpdate);
    window.addEventListener('productivityUpdate', handleAnalyticsUpdate);
    
    // Initial delay to ensure localStorage is populated
    const timer = setTimeout(() => {
      calculateAnalytics();
    }, 500);
    
    return () => {
      window.removeEventListener('heatmapUpdate', handleAnalyticsUpdate);
      window.removeEventListener('badgeUpdate', handleAnalyticsUpdate);
      window.removeEventListener('productivityUpdate', handleAnalyticsUpdate);
      clearTimeout(timer);
    };
  }, []);

  const calculateAnalytics = () => {
    // Get data from localStorage (no simulation)
    const tasksCompleted = parseInt(localStorage.getItem('tasksCompleted') || '0');
    const goalsCompleted = parseInt(localStorage.getItem('goalsCompleted') || '0');
    const totalGoals = parseInt(localStorage.getItem('totalGoals') || '0');
    const productivityData = JSON.parse(localStorage.getItem('productivityData') || '{}');

    calculateAnalyticsFromData(productivityData, tasksCompleted, goalsCompleted, totalGoals);
  };

  const calculateAnalyticsFromData = (data, tasks, goals, totalGoals) => {
    const dates = Object.keys(data).sort();
    const today = new Date();
    
    // Get last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push({
        date: dateStr,
        count: data[dateStr] || 0,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }

    // Calculate total from data
    const totalFromData = Object.values(data).reduce((sum, val) => sum + val, 0);
    const totalTasks = Math.max(tasks, totalFromData);

    // Weekly completion rate (tasks completed in last 7 days / expected)
    const weeklyTasks = last7Days.reduce((sum, day) => sum + day.count, 0);
    const expectedWeekly = 7 * 3; // Assume 3 tasks per day as target
    const weeklyRate = Math.min(100, Math.round((weeklyTasks / expectedWeekly) * 100));

    // Average tasks per day (last 30 days)
    const daysWithData = dates.length || 30;
    const avgPerDay = (totalTasks / daysWithData).toFixed(1);

    // Goal completion rate
    const goalRate = totalGoals > 0 ? Math.round((goals / totalGoals) * 100) : 0;

    setAnalytics({
      totalTasks,
      weeklyRate,
      avgPerDay,
      goalRate,
      weeklyData: last7Days,
    });
  };

  const StatCard = ({ icon, label, value, suffix, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.03 }}
      className={`bg-gradient-to-br ${color} rounded-lg p-5 shadow-md`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.3, type: 'spring' }}
          className="text-2xl font-bold text-gray-800 dark:text-white"
        >
          {value}{suffix}
        </motion.span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{label}</p>
    </motion.div>
  );

  const maxCount = Math.max(...analytics.weeklyData.map(d => d.count), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-6xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-gray-800 dark:text-white mb-6"
      >
        📊 Analytics Overview
      </motion.h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="✅"
          label="Total Tasks"
          value={analytics.totalTasks}
          suffix=""
          color="from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40"
          delay={0}
        />
        <StatCard
          icon="📈"
          label="Weekly Rate"
          value={analytics.weeklyRate}
          suffix="%"
          color="from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40"
          delay={0.1}
        />
        <StatCard
          icon="📅"
          label="Avg Per Day"
          value={analytics.avgPerDay}
          suffix=""
          color="from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40"
          delay={0.2}
        />
        <StatCard
          icon="🎯"
          label="Goal Rate"
          value={analytics.goalRate}
          suffix="%"
          color="from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40"
          delay={0.3}
        />
      </div>

      {/* Weekly Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Last 7 Days Activity
        </h3>
        <div className="flex items-end justify-between gap-2 h-40">
          {analytics.weeklyData.map((day, index) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(day.count / maxCount) * 100}%` }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg min-h-[4px] relative group"
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {day.count} tasks
                </div>
              </motion.div>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {day.day}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

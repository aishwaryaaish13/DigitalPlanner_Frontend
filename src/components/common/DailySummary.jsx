import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function DailySummary() {
  const [summary, setSummary] = useState({
    message: '',
    motivation: '',
    trend: 'neutral',
    percentage: 0,
    yesterdayTasks: 0,
  });

  useEffect(() => {
    generateSummary();
    
    // Listen for updates
    const handleSummaryUpdate = () => {
      generateSummary();
    };
    
    window.addEventListener('heatmapUpdate', handleSummaryUpdate);
    window.addEventListener('productivityUpdate', handleSummaryUpdate);
    
    // Initial delay to ensure localStorage is populated
    const timer = setTimeout(() => {
      generateSummary();
    }, 500);
    
    return () => {
      window.removeEventListener('heatmapUpdate', handleSummaryUpdate);
      window.removeEventListener('productivityUpdate', handleSummaryUpdate);
      clearTimeout(timer);
    };
  }, []);

  const generateSummary = () => {
    const productivityData = JSON.parse(localStorage.getItem('productivityData') || '{}');
    
    // Get yesterday and last week's data
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get last week's average (7-13 days ago)
    let lastWeekTotal = 0;
    let lastWeekDays = 0;
    for (let i = 7; i <= 13; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (productivityData[dateStr] !== undefined) {
        lastWeekTotal += productivityData[dateStr];
        lastWeekDays++;
      }
    }

    const yesterdayTasks = productivityData[yesterdayStr] || 0;
    const lastWeekAvg = lastWeekDays > 0 ? lastWeekTotal / lastWeekDays : 0;

    // Calculate trend
    let trend = 'neutral';
    let percentage = 0;
    
    if (lastWeekAvg > 0) {
      percentage = Math.round(((yesterdayTasks - lastWeekAvg) / lastWeekAvg) * 100);
      if (percentage > 5) trend = 'up';
      else if (percentage < -5) trend = 'down';
    } else if (yesterdayTasks > 0) {
      trend = 'up';
      percentage = 100;
    }

    // Generate message
    let message = '';
    let motivation = '';

    if (yesterdayTasks === 0 && Object.keys(productivityData).length === 0) {
      message = "Start your productivity journey today!";
      motivation = "Complete your first task and begin tracking your progress. You've got this! 💪";
    } else if (yesterdayTasks === 0) {
      message = "You didn't complete any tasks yesterday.";
      motivation = "Today is a fresh start! Let's make it count. 💪";
    } else if (trend === 'up') {
      message = `You completed ${yesterdayTasks} task${yesterdayTasks > 1 ? 's' : ''} yesterday and improved by ${Math.abs(percentage)}% compared to last week!`;
      motivation = "You're on fire! Keep up the amazing momentum! 🔥";
    } else if (trend === 'down') {
      message = `You completed ${yesterdayTasks} task${yesterdayTasks > 1 ? 's' : ''} yesterday, ${Math.abs(percentage)}% less than last week.`;
      motivation = "Don't worry! Every day is a chance to bounce back stronger. 🌟";
    } else {
      message = `You completed ${yesterdayTasks} task${yesterdayTasks > 1 ? 's' : ''} yesterday, maintaining your steady pace.`;
      motivation = "Consistency is key! You're doing great. ✨";
    }

    setSummary({ message, motivation, trend, percentage: Math.abs(percentage), yesterdayTasks });
  };

  const getTrendIcon = () => {
    if (summary.trend === 'up') return '↑';
    if (summary.trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = () => {
    if (summary.trend === 'up') return 'text-green-500';
    if (summary.trend === 'down') return 'text-red-500';
    return 'text-gray-500';
  };

  const getBackgroundGradient = () => {
    if (summary.trend === 'up') return 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20';
    if (summary.trend === 'down') return 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20';
    return 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-br ${getBackgroundGradient()} rounded-2xl shadow-xl p-8 w-full border-2 border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300`}
    >
      <div className="flex items-start justify-between mb-6">
        <motion.h2
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3"
        >
          <span className="text-4xl">📋</span>
          <span>Daily Summary</span>
        </motion.h2>
        
        {summary.percentage > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className={`flex items-center gap-2 text-3xl font-bold ${getTrendColor()} bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-xl`}
          >
            <span className="text-4xl">{getTrendIcon()}</span>
            <span>{summary.percentage}%</span>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <p className="text-xl text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
          {summary.message}
        </p>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 border-l-4 border-blue-500 shadow-md"
        >
          <p className="text-lg text-gray-800 dark:text-gray-100 font-semibold">
            {summary.motivation}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-between pt-4 text-base text-gray-600 dark:text-gray-400 border-t border-gray-300 dark:border-gray-600"
        >
          <span className="font-medium">Yesterday's Tasks: <span className="text-lg font-bold text-gray-800 dark:text-white">{summary.yesterdayTasks}</span></span>
          <span className="font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

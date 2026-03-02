import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Card, CardContent } from '../common/Card.jsx';
import { CheckCircle2, Target, Smile, Loader2, Flame } from 'lucide-react';
import { taskService } from '../../services/taskService.js';
import { goalService } from '../../services/goalService.js';
import { moodService } from '../../services/moodService.js';
import { habitService } from '../../services/habitService.js';
import { getMoodEmoji } from '../../utils/helpers.js';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export const SummaryCards = () => {
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    totalTasks: 0,
    goalsProgress: 0,
    todayMood: null,
    habitsCompleted: 0,
    totalHabits: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [tasks, goals, moods, habits] = await Promise.all([
        taskService.getTasks().catch(() => []),
        goalService.getGoals().catch(() => []),
        moodService.getMoods().catch(() => []),
        habitService.getHabits().catch(() => []),
      ]);

      // Calculate tasks completed
      const completedTasks = Array.isArray(tasks) 
        ? tasks.filter(t => t.completed).length 
        : 0;
      const totalTasks = Array.isArray(tasks) ? tasks.length : 0;

      // Calculate average goals progress
      let avgProgress = 0;
      if (Array.isArray(goals) && goals.length > 0) {
        const totalProgress = goals.reduce((sum, goal) => {
          const current = goal.current_value || goal.current || 0;
          const target = goal.target_value || goal.target || 1;
          return sum + (current / target) * 100;
        }, 0);
        avgProgress = Math.round(totalProgress / goals.length);
      }

      // Get today's mood (most recent)
      const todayMood = Array.isArray(moods) && moods.length > 0 
        ? moods[0].mood 
        : null;

      // Calculate habits completed today
      const completedHabits = Array.isArray(habits)
        ? habits.filter(h => h.completedToday || h.completed_today).length
        : 0;
      const totalHabits = Array.isArray(habits) ? habits.length : 0;

      setStats({
        tasksCompleted: completedTasks,
        totalTasks,
        goalsProgress: avgProgress,
        todayMood,
        habitsCompleted: completedHabits,
        totalHabits,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const summaryData = [
    {
      title: 'Tasks Completed',
      value: isLoading ? '...' : `${stats.tasksCompleted}/${stats.totalTasks}`,
      change: stats.totalTasks > 0 
        ? `${Math.round((stats.tasksCompleted / stats.totalTasks) * 100)}% complete`
        : 'No tasks yet',
      icon: CheckCircle2,
      color: 'bg-blue-500/10 text-blue-600',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Goals Progress',
      value: isLoading ? '...' : `${stats.goalsProgress}%`,
      change: 'Overall completion',
      icon: Target,
      color: 'bg-purple-500/10 text-purple-600',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Mood Today',
      value: isLoading ? '...' : (stats.todayMood ? getMoodEmoji(stats.todayMood) : '😐'),
      change: stats.todayMood ? `Feeling ${stats.todayMood}` : 'No mood logged',
      icon: Smile,
      color: 'bg-yellow-500/10 text-yellow-600',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      title: 'Habits Today',
      value: isLoading ? '...' : `${stats.habitsCompleted}/${stats.totalHabits}`,
      change: stats.totalHabits > 0
        ? `${Math.round((stats.habitsCompleted / stats.totalHabits) * 100)}% complete`
        : 'No habits yet',
      icon: Flame,
      color: 'bg-orange-500/10 text-orange-600',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {summaryData.map((item, index) => (
        <motion.div 
          key={index} 
          variants={itemVariants}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Card className="overflow-hidden hover:shadow-2xl transition-all relative group border-2 hover:border-primary/30">
            {/* Animated gradient background */}
            <motion.div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-20 rounded-full -mr-16 -mt-16 blur-2xl`}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <CardContent className="relative p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <motion.p 
                    className="text-sm font-medium text-muted-foreground mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    {item.title}
                  </motion.p>
                  <div className="flex items-baseline gap-2">
                    <motion.h3 
                      className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 200,
                        delay: 0.3 + index * 0.1 
                      }}
                    >
                      {item.value}
                    </motion.h3>
                  </div>
                  <motion.p 
                    className="text-xs text-muted-foreground mt-2 flex items-center gap-1"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    {item.change}
                  </motion.p>
                </div>
                <motion.div 
                  className={`p-3 rounded-xl ${item.color} shadow-lg`}
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <item.icon className="w-6 h-6" />
                </motion.div>
              </div>

              {/* Progress bar for tasks and habits */}
              {(item.title === 'Tasks Completed' || item.title === 'Habits Today') && stats.totalTasks > 0 && (
                <motion.div 
                  className="mt-4 h-2 bg-muted rounded-full overflow-hidden"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                >
                  <motion.div
                    className={`h-full bg-gradient-to-r ${item.gradient} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ 
                      width: item.title === 'Tasks Completed' 
                        ? `${(stats.tasksCompleted / stats.totalTasks) * 100}%`
                        : `${(stats.habitsCompleted / stats.totalHabits) * 100}%`
                    }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                  />
                </motion.div>
              )}

              {/* Progress bar for goals */}
              {item.title === 'Goals Progress' && stats.goalsProgress > 0 && (
                <motion.div 
                  className="mt-4 h-2 bg-muted rounded-full overflow-hidden"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                >
                  <motion.div
                    className={`h-full bg-gradient-to-r ${item.gradient} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.goalsProgress}%` }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                  />
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

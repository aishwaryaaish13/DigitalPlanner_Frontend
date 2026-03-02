import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card.jsx';
import { Loader2 } from 'lucide-react';
import { taskService } from '../../services/taskService.js';
import { moodService } from '../../services/moodService.js';
import { habitService } from '../../services/habitService.js';
import { goalService } from '../../services/goalService.js';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
};

const moodColors = {
  excellent: '#10b981',
  good: '#3b82f6',
  neutral: '#f59e0b',
  bad: '#ef4444',
  terrible: '#8b5cf6',
};

const moodValues = {
  excellent: 5,
  good: 4,
  neutral: 3,
  bad: 2,
  terrible: 1,
};

export const DashboardCharts = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [moodDistribution, setMoodDistribution] = useState([]);
  const [goalsData, setGoalsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setIsLoading(true);
      
      const [tasks, moods, habits, goals] = await Promise.all([
        taskService.getTasks().catch(() => []),
        moodService.getMoods().catch(() => []),
        habitService.getHabits().catch(() => []),
        goalService.getGoals().catch(() => []),
      ]);

      // Process weekly task data (last 7 days)
      const last7Days = getLast7Days();
      const weeklyTaskData = last7Days.map(day => {
        const dayTasks = Array.isArray(tasks) ? tasks.filter(t => {
          const taskDate = new Date(t.created_at || t.createdAt);
          return taskDate.toDateString() === day.date.toDateString();
        }) : [];
        
        const dayMoods = Array.isArray(moods) ? moods.filter(m => {
          const moodDate = new Date(m.created_at || m.createdAt);
          return moodDate.toDateString() === day.date.toDateString();
        }) : [];

        const avgMood = dayMoods.length > 0
          ? dayMoods.reduce((sum, m) => sum + (moodValues[m.mood?.toLowerCase()] || 3), 0) / dayMoods.length
          : 0;

        return {
          name: day.name,
          tasks: dayTasks.length,
          completed: dayTasks.filter(t => t.completed).length,
          mood: Math.round(avgMood * 10) / 10,
        };
      });
      setWeeklyData(weeklyTaskData);

      // Process mood distribution
      const moodCounts = {};
      if (Array.isArray(moods)) {
        moods.forEach(m => {
          const mood = m.mood?.toLowerCase() || 'neutral';
          moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });
      }

      const moodDist = Object.entries(moodCounts).map(([mood, count]) => ({
        name: mood.charAt(0).toUpperCase() + mood.slice(1),
        value: count,
        color: moodColors[mood] || '#6b7280',
      }));
      setMoodDistribution(moodDist.length > 0 ? moodDist : [
        { name: 'No Data', value: 1, color: '#6b7280' }
      ]);

      // Process goals data
      const goalsChartData = Array.isArray(goals) ? goals.slice(0, 5).map(g => ({
        name: (g.title || 'Untitled').substring(0, 15) + (g.title?.length > 15 ? '...' : ''),
        progress: Math.round(((g.current_value || g.current || 0) / (g.target_value || g.target || 1)) * 100),
        target: 100,
      })) : [];
      setGoalsData(goalsChartData);

    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLast7Days = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        name: dayNames[date.getDay()],
        date: date,
      });
    }
    return days;
  };

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
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      {/* Task Completion Chart */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className="group"
      >
        <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <span className="group-hover:text-primary transition-colors">Weekly Tasks (Last 7 Days)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {weeklyData.length > 0 && weeklyData.some(d => d.tasks > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--background)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="tasks" fill="#3b82f6" name="Total Tasks" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No task data yet. Create some tasks to see the chart!
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Mood Distribution */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className="group"
      >
        <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">😊</span>
              <span className="group-hover:text-primary transition-colors">Mood Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {moodDistribution.length > 0 && moodDistribution[0].name !== 'No Data' ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={moodDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {moodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--background)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No mood data yet. Log your mood to see the distribution!
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Goals Progress */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className="group"
      >
        <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
          <CardHeader className="bg-gradient-to-r from-violet-500/10 to-purple-500/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="group-hover:text-primary transition-colors">Goals Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {goalsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={goalsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--background)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="progress" fill="#8b5cf6" name="Progress %" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No goals yet. Create some goals to track progress!
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Mood Trend Line */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className="group"
      >
        <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
          <CardHeader className="bg-gradient-to-r from-amber-500/10 to-orange-500/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">📈</span>
              <span className="group-hover:text-primary transition-colors">Mood Trend (Last 7 Days)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {weeklyData.length > 0 && weeklyData.some(d => d.mood > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--background)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 5, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7 }}
                    name="Mood Score (1-5)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No mood trend data yet. Log your mood daily to see the trend!
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

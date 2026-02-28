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
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
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
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Task Completion Chart */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📊 Weekly Tasks (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyData.length > 0 && weeklyData.some(d => d.tasks > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" fill="#3b82f6" name="Total Tasks" />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No task data yet. Create some tasks to see the chart!
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Mood Distribution */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">😊 Mood Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {moodDistribution.length > 0 && moodDistribution[0].name !== 'No Data' ? (
              <ResponsiveContainer width="100%" height={300}>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No mood data yet. Log your mood to see the distribution!
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Goals Progress */}
      {goalsData.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎯 Top 5 Goals Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={goalsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="progress" fill="#8b5cf6" name="Progress %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Mood Trend Line */}
      <motion.div variants={itemVariants} className={goalsData.length > 0 ? '' : 'lg:col-span-2'}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📈 Mood Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyData.length > 0 && weeklyData.some(d => d.mood > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 4 }}
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

import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Input } from '../common/Input.jsx';
import { Plus, Edit2, Trash2, GripVertical, Loader2, Target, TrendingUp, Award, Calendar, Zap } from 'lucide-react';
import { calculateProgress } from '../../utils/helpers.js';
import { goalService } from '../../services/goalService.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { createNotification } from '../../utils/notificationHelpers.js';
import { useProductivity } from '../../context/ProductivityContext.jsx';
import toast from 'react-hot-toast';

const motivationalQuotes = [
  "Dream big, start small, act now.",
  "Goals are dreams with deadlines.",
  "The future depends on what you do today.",
  "Success is the sum of small efforts repeated daily.",
  "Your only limit is you.",
  "Make each day your masterpiece.",
  "Progress, not perfection.",
  "Believe you can and you're halfway there.",
  "Small steps every day lead to big results.",
  "The best time to start was yesterday. The next best time is now."
];

export const GoalsList = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotifications();
  const { incrementGoal, setTotalGoals: updateTotalGoals } = useProductivity();
  const [error, setError] = useState(null);
  const [currentQuote, setCurrentQuote] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: 0,
    deadline: '',
  });

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
    // Set random motivational quote
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuoteIndex(randomIndex);
    setCurrentQuote(motivationalQuotes[randomIndex]);
  }, []);

  // Auto-rotate quotes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => {
        const nextIndex = (prev + 1) % motivationalQuotes.length;
        setCurrentQuote(motivationalQuotes[nextIndex]);
        return nextIndex;
      });
    }, 10000); // Change quote every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await goalService.getGoals();
      setGoals(data);
      
      // Update total goals in backend
      try {
        await updateTotalGoals(data.length);
      } catch (err) {
        console.error('Error updating total goals:', err);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch goals');
      toast.error('Failed to load goals');
      console.error('Error fetching goals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setGoals((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addGoal = async () => {
    if (!newGoal.title.trim()) {
      toast.error('Please enter a goal title');
      return;
    }

    try {
      const createdGoal = await goalService.createGoal({
        title: newGoal.title,
        description: newGoal.description,
        target_value: newGoal.target,
        current_value: 0,
        deadline: newGoal.deadline || null,
      });
      setGoals([...goals, createdGoal]);
      setNewGoal({
        title: '',
        description: '',
        target: 0,
        deadline: '',
      });
      
      // Update total goals in backend
      try {
        await updateTotalGoals(goals.length + 1);
      } catch (err) {
        console.error('Error updating total goals:', err);
      }
      
      addNotification(
        createNotification.success('Goal Created', `"${newGoal.title}" has been added`)
      );
      
      toast.success('Goal created successfully');
    } catch (err) {
      toast.error('Failed to create goal');
      console.error('Error creating goal:', err);
    }
  };

  const updateProgress = async (id, newProgress) => {
    const goal = goals.find(g => g.id === id);
    const oldProgress = goal.current_value || goal.current || 0;
    const targetValue = goal.target_value || goal.target;
    const wasCompleted = oldProgress >= targetValue;
    
    try {
      const updatedGoal = await goalService.updateGoal(id, {
        current_value: Math.min(newProgress, targetValue)
      });
      setGoals(
        goals.map((g) =>
          g.id === id ? updatedGoal : g
        )
      );
      
      // Check if goal just reached 100%
      const isNowCompleted = newProgress >= targetValue;
      if (isNowCompleted && !wasCompleted) {
        // Increment goals completed in backend
        try {
          await incrementGoal();
        } catch (err) {
          console.error('Error incrementing goal:', err);
        }
        
        addNotification(
          createNotification.success(
            'Goal Completed! 🎉',
            `You achieved "${goal.title}"`
          )
        );
        toast.success('Goal completed!');
      }
    } catch (err) {
      toast.error('Failed to update progress');
      console.error('Error updating progress:', err);
    }
  };

  const deleteGoal = async (id) => {
    const goal = goals.find(g => g.id === id);
    try {
      await goalService.deleteGoal(id);
      setGoals(goals.filter((g) => g.id !== id));
      
      // Update total goals in backend
      try {
        await updateTotalGoals(goals.length - 1);
      } catch (err) {
        console.error('Error updating total goals:', err);
      }
      
      if (goal) {
        addNotification(
          createNotification.info('Goal Deleted', `"${goal.title}" has been removed`)
        );
      }
      
      toast.success('Goal deleted successfully');
    } catch (err) {
      toast.error('Failed to delete goal');
      console.error('Error deleting goal:', err);
    }
  };

  const getGoalStats = () => {
    const total = goals.length;
    const completed = goals.filter(g => {
      const current = g.current_value || g.current || 0;
      const target = g.target_value || g.target || 1;
      return current >= target;
    }).length;
    const inProgress = total - completed;
    const avgProgress = total > 0 
      ? Math.round(goals.reduce((sum, g) => {
          const current = g.current_value || g.current || 0;
          const target = g.target_value || g.target || 1;
          return sum + (current / target) * 100;
        }, 0) / total)
      : 0;
    
    return { total, completed, inProgress, avgProgress };
  };

  const stats = getGoalStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive text-center">{error}</p>
          <Button onClick={fetchGoals} className="mt-4 mx-auto block">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Quote */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="flex items-center justify-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Target className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Goal Tracker
          </h1>
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Award className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 blur-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 20, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -20, rotateX: 90 }}
              transition={{ 
                duration: 0.6,
                ease: "easeOut"
              }}
              className="relative text-lg italic text-muted-foreground font-medium px-6 py-3 bg-card/50 backdrop-blur-sm rounded-lg border border-primary/20"
            >
              <motion.span
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundImage: 'linear-gradient(90deg, currentColor 0%, var(--primary) 50%, currentColor 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                }}
              >
                "{currentQuote}"
              </motion.span>
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Stats Dashboard */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Goals</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                  <p className="text-2xl font-bold">{stats.avgProgress}%</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Add Goal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Plus className="w-6 h-6 text-primary" />
              </motion.div>
              <CardTitle className="text-xl">Create New Goal</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Set a clear target and track your progress
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Goal Title</label>
              <Input
                placeholder="e.g., Read 12 books this year"
                value={newGoal.title}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Input
                placeholder="Add more details about your goal..."
                value={newGoal.description}
                onChange={(e) =>
                  setNewGoal({
                    ...newGoal,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Target Value</label>
                <Input
                  type="number"
                  placeholder="e.g., 12"
                  value={newGoal.target}
                  onChange={(e) =>
                    setNewGoal({
                      ...newGoal,
                      target: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Deadline
                </label>
                <Input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) =>
                    setNewGoal({
                      ...newGoal,
                      deadline: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <motion.button
              onClick={addGoal}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-4 py-3 bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create Goal
            </motion.button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Goals List with Drag and Drop */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-4"
        >
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Your Goals
          </h2>
          <span className="text-sm text-muted-foreground">
            Drag to reorder
          </span>
        </motion.div>
      )}
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={goals.map((g) => g.id)}
          strategy={verticalListSortingStrategy}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
            className="space-y-4"
          >
            <AnimatePresence>
              {goals.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    🎯
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
                  <p className="text-muted-foreground">
                    Create your first goal and start your journey to success!
                  </p>
                </motion.div>
              ) : (
                goals.map((goal) => {
                  const progress = calculateProgress(
                    goal.current_value || goal.current || 0,
                    goal.target_value || goal.target || 1
                  );

                  return (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      progress={progress}
                      onDelete={() => deleteGoal(goal.id)}
                      onProgressChange={(newProgress) =>
                        updateProgress(goal.id, newProgress)
                      }
                    />
                  );
                })
              )}
            </AnimatePresence>
          </motion.div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

const GoalCard = ({ goal, progress, onDelete, onProgressChange }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCompleted = progress >= 100;
  const current = goal.current_value || goal.current || 0;
  const target = goal.target_value || goal.target || 1;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <Card className={`hover:shadow-xl transition-all border-2 ${
        isDragging ? 'shadow-xl border-primary' : 
        isCompleted ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : 
        'border-border'
      }`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <motion.button
                  {...attributes}
                  {...listeners}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </motion.button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <Award className="w-5 h-5 text-green-500" />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {goal.description}
                  </p>
                </div>
              </div>
            </div>
            <motion.button
              onClick={() => onDelete()}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </motion.button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Progress
              </span>
              <motion.span
                key={progress}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-sm font-bold ${
                  isCompleted ? 'text-green-500' : 'text-primary'
                }`}
              >
                {progress}%
              </motion.span>
            </div>
            <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
                className={`h-full rounded-full shadow-lg relative overflow-hidden ${
                  isCompleted 
                    ? 'bg-gradient-to-r from-green-400 via-emerald-400 to-green-500'
                    : 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400'
                }`}
              >
                {/* Animated shine effect */}
                <motion.div
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>
          </div>

          {/* Progress Input */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2">
              <motion.input
                type="number"
                min="0"
                max={target}
                value={current}
                onChange={(e) =>
                  onProgressChange(parseInt(e.target.value) || 0)
                }
                whileFocus={{ scale: 1.02 }}
                className="input-base flex-1 h-10 text-center font-semibold"
              />
              <span className="text-lg font-bold text-muted-foreground">/</span>
              <div className="px-3 py-2 bg-muted rounded-lg font-semibold min-w-[60px] text-center">
                {target}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onProgressChange(Math.min(current + 1, target))}
              className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Deadline */}
          {goal.deadline && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg"
            >
              <Calendar className="w-4 h-4" />
              <span>Due: {new Date(goal.deadline).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

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
import { Plus, Edit2, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { calculateProgress } from '../../utils/helpers.js';
import { goalService } from '../../services/goalService.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { createNotification } from '../../utils/notificationHelpers.js';
import { useProductivity } from '../../context/ProductivityContext.jsx';
import toast from 'react-hot-toast';

export const GoalsList = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotifications();
  const { incrementGoal, setTotalGoals: updateTotalGoals } = useProductivity();
  const [error, setError] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: 0,
    deadline: '',
  });

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
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
      {/* Add Goal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Add New Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Goal title"
              value={newGoal.title}
              onChange={(e) =>
                setNewGoal({ ...newGoal, title: e.target.value })
              }
            />
            <Input
              placeholder="Description"
              value={newGoal.description}
              onChange={(e) =>
                setNewGoal({
                  ...newGoal,
                  description: e.target.value,
                })
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Target"
                value={newGoal.target}
                onChange={(e) =>
                  setNewGoal({
                    ...newGoal,
                    target: parseInt(e.target.value) || 0,
                  })
                }
              />
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
            <motion.button
              onClick={addGoal}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </motion.button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Goals List with Drag and Drop */}
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
              {goals.map((goal) => {
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
              })}
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
      <Card className={`hover:shadow-lg transition-all ${isDragging ? 'shadow-lg' : ''}`}>
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
                <div>
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {goal.description}
                  </p>
                </div>
              </div>
            </div>
            <motion.button
              onClick={() => onDelete()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-destructive/10 rounded"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </motion.button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-bold text-primary"
              >
                {progress}%
              </motion.span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{
                  duration: 0.6,
                  ease: 'easeOut',
                }}
                className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full shadow-lg"
              />
            </div>
          </div>

          {/* Progress Input */}
          <div className="flex items-center gap-2">
            <motion.input
              type="number"
              min="0"
              max={goal.target_value || goal.target}
              value={goal.current_value || goal.current || 0}
              onChange={(e) =>
                onProgressChange(parseInt(e.target.value) || 0)
              }
              whileFocus={{ scale: 1.05 }}
              className="input-base flex-1 h-9"
            />
            <span className="text-sm font-medium text-muted-foreground">
              / {goal.target_value || goal.target}
            </span>
          </div>

          {/* Deadline */}
          {goal.deadline && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground"
            >
              Due: {goal.deadline}
            </motion.p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

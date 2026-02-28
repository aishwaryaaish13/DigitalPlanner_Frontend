import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
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
import { Plus, Check, X, Flame, GripVertical, Loader2 } from 'lucide-react';
import { habitService } from '../../services/habitService.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { createNotification } from '../../utils/notificationHelpers.js';
import toast from 'react-hot-toast';

export const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const { addNotification } = useNotifications();

  // Fetch habits on component mount
  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await habitService.getHabits();
      console.log('Fetched habits:', data);
      setHabits(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch habits');
      toast.error('Failed to load habits');
      console.error('Error fetching habits:', err);
      console.error('Error response:', err.response?.data);
      setHabits([]);
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
      setHabits((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addHabit = async () => {
    if (!newHabit.name.trim()) {
      toast.error('Please enter a habit name');
      return;
    }

    try {
      setIsAdding(true);
      const createdHabit = await habitService.createHabit({
        habit_name: newHabit.name,
        frequency: 'daily', // Default frequency
      });
      setHabits([...habits, createdHabit]);
      setNewHabit({ name: '', description: '' });
      
      addNotification(
        createNotification.success('Habit Created', `"${newHabit.name}" has been added`)
      );
      
      toast.success('Habit created successfully');
    } catch (err) {
      toast.error('Failed to create habit');
      console.error('Error creating habit:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleHabit = async (id) => {
    const habit = habits.find(h => h.id === id);
    const wasCompleted = habit.completed_today || habit.completedToday || false;
    const isCompleted = !wasCompleted;
    
    try {
      // Optimistically update UI
      const newStreak = isCompleted 
        ? (habit.streak || 0) + 1 
        : Math.max((habit.streak || 0) - 1, 0);
      
      setHabits(
        habits.map((h) =>
          h.id === id ? { 
            ...h, 
            completed_today: isCompleted,
            completedToday: isCompleted,
            streak: newStreak
          } : h
        )
      );
      
      // Update backend - send all fields to ensure backend has the data
      const updatedHabit = await habitService.updateHabit(id, {
        habit_name: habit.habit_name || habit.name,
        frequency: habit.frequency || 'daily',
        completed_today: isCompleted,
        streak: newStreak,
      });
      
      // Sync with backend response if it returns updated data
      if (updatedHabit) {
        setHabits(
          habits.map((h) =>
            h.id === id ? { 
              ...h,
              ...updatedHabit, 
              completedToday: updatedHabit.completed_today ?? isCompleted,
              streak: updatedHabit.streak ?? newStreak
            } : h
          )
        );
      }
      
      // Add notification for habit completion
      if (isCompleted) {
        addNotification(
          createNotification.success(
            'Habit Completed!',
            `Great job! You completed "${habit.habit_name || habit.name}"`
          )
        );
        toast.success('Habit marked as complete');
      } else {
        addNotification(
          createNotification.info(
            'Habit Uncompleted',
            `"${habit.habit_name || habit.name}" marked as incomplete`
          )
        );
        toast.success('Habit marked as incomplete');
      }
    } catch (err) {
      // Revert optimistic update on error
      setHabits(
        habits.map((h) =>
          h.id === id ? habit : h
        )
      );
      toast.error('Failed to update habit');
      console.error('Error updating habit:', err);
      console.error('Error response:', err.response?.data);
    }
  };

  const deleteHabit = async (id) => {
    const habit = habits.find(h => h.id === id);
    try {
      await habitService.deleteHabit(id);
      setHabits(habits.filter((h) => h.id !== id));
      
      if (habit) {
        addNotification(
          createNotification.info(
            'Habit Deleted',
            `"${habit.habit_name || habit.name}" has been removed`
          )
        );
      }
      
      toast.success('Habit deleted successfully');
    } catch (err) {
      toast.error('Failed to delete habit');
      console.error('Error deleting habit:', err);
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
          <Button onClick={fetchHabits} className="mt-4 mx-auto block">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const completedToday = habits.filter((h) => h.completedToday || h.completed_today).length;
  const completionRate = habits.length > 0 
    ? Math.round((completedToday / habits.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">
                📋 Completed Today
              </p>
              <motion.p
                key={`${completedToday}-${habits.length}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold"
              >
                {completedToday}/{habits.length}
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">
                ✅ Completion Rate
              </p>
              <motion.p
                key={completionRate}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold"
              >
                {completionRate}%
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">
                🔥 Total Habits
              </p>
              <motion.p
                key={habits.length}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold"
              >
                {habits.length}
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Add Habit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>➕ Add New Habit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Habit name"
              value={newHabit.name}
              onChange={(e) =>
                setNewHabit({ ...newHabit, name: e.target.value })
              }
            />
            <Input
              placeholder="Description"
              value={newHabit.description}
              onChange={(e) =>
                setNewHabit({
                  ...newHabit,
                  description: e.target.value,
                })
              }
            />
            <motion.button
              onClick={addHabit}
              disabled={isAdding}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Habit
                </>
              )}
            </motion.button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Habits List with Drag and Drop */}
      {habits.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No habits yet. Create your first habit to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={habits.map((h) => h.id)}
            strategy={verticalListSortingStrategy}
          >
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
            >
              <AnimatePresence>
                {habits.map((habit) => (
                  <HabitItem
                    key={habit.id}
                    habit={habit}
                    onToggle={() => toggleHabit(habit.id)}
                    onDelete={() => deleteHabit(habit.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

const HabitItem = ({ habit, onToggle, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Check both field names for completion status
  const isCompleted = habit.completedToday || habit.completed_today || false;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={isDragging ? 'opacity-50' : ''}
    >
      <Card
        className={`transition-all hover:shadow-lg ${
          isCompleted
            ? 'bg-green-50 dark:bg-green-900/20'
            : ''
        } ${isDragging ? 'shadow-lg' : ''}`}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Drag handle */}
            <motion.button
              {...attributes}
              {...listeners}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </motion.button>

            {/* Check button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggle}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <Check className="w-5 h-5" />
                </motion.div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              )}
            </motion.button>

            <div className="flex-1 min-w-0">
              <motion.h4 
                className={`font-medium ${
                  isCompleted ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {habit.habit_name || habit.name}
              </motion.h4>
              <p className="text-sm text-muted-foreground">
                {habit.description}
              </p>
            </div>
          </div>

          {/* Streak and Delete */}
          <div className="flex items-center gap-4">
            {habit.streak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20"
              >
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  {habit.streak}
                </span>
              </motion.div>
            )}

            <motion.button
              onClick={onDelete}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="p-1 hover:bg-destructive/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-destructive" />
            </motion.button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

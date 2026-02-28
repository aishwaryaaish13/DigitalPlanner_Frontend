import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Input } from '../common/Input.jsx';
import { Modal } from '../common/Modal.jsx';
import { Textarea } from '../common/Textarea.jsx';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Flag,
  GripVertical,
  Loader2,
} from 'lucide-react';
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
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { getPriorityColor } from '../../utils/helpers.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { createNotification } from '../../utils/notificationHelpers.js';
import { taskService } from '../../services/taskService.js';
import { useProductivity } from '../../context/ProductivityContext.jsx';
import toast from 'react-hot-toast';

export const TasksList = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [parent] = useAutoAnimate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
  });
  const { addNotification } = useNotifications();
  const { incrementTask, decrementTask } = useProductivity();

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await taskService.getTasks();
      console.log('Fetched tasks from service:', data);
      if (data.length > 0) {
        console.log('Sample task structure:', {
          id: data[0].id,
          task_id: data[0].task_id,
          title: data[0].title,
          completed: data[0].completed,
          allKeys: Object.keys(data[0])
        });
      }
      // Ensure data is an array
      const tasksArray = Array.isArray(data) ? data : [];
      setTasks(tasksArray);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
      toast.error('Failed to load tasks');
      console.error('Error fetching tasks:', err);
      console.error('Error response:', err.response?.data);
      setTasks([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      console.log('Creating task with data:', newTask);
      const createdTask = await taskService.createTask(newTask);
      console.log('Task created:', createdTask);
      setTasks([...tasks, createdTask]);
      setNewTask({ title: '', description: '', priority: 'medium' });
      setIsModalOpen(false);
      addNotification(
        createNotification.success('Task Created', `"${createdTask.title}" has been added`)
      );
      toast.success('Task created successfully');
    } catch (err) {
      console.error('Error creating task:', err);
      console.error('Error response:', err.response?.data);
      toast.error(err.response?.data?.error || 'Failed to create task');
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
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over.id);
      setTasks(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  const filteredTasks = Array.isArray(tasks) ? tasks.filter((task) => {
    const matchesSearch = (task.title || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPriority =
      priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  }) : [];

  // Separate active and completed tasks
  const activeTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);

  const toggleTask = async (id) => {
    console.log('toggleTask called with id:', id, 'type:', typeof id);
    
    const task = tasks.find(t => t.id === id);
    if (!task) {
      console.error('Task not found for id:', id);
      console.error('Available tasks:', tasks.map(t => ({ id: t.id, title: t.title })));
      toast.error('Task not found');
      return;
    }
    
    if (!task.id) {
      console.error('Task has no ID:', task);
      toast.error('Invalid task ID');
      return;
    }
    
    const newCompletedStatus = !(task.completed ?? false);
    console.log('Toggling task:', { id: task.id, title: task.title, completed: task.completed, newStatus: newCompletedStatus });
    
    // Optimistically update UI immediately
    const updatedTaskOptimistic = { ...task, completed: newCompletedStatus };
    setTasks(
      tasks.map((t) =>
        t.id === id ? updatedTaskOptimistic : t
      )
    );
    
    try {
      // Send update to backend but don't use the response since it returns stale data
      await taskService.updateTask(task.id, {
        completed: newCompletedStatus
      });
      
      console.log('Task updated on backend, keeping optimistic update');
      
      // Add notification when task is completed
      if (newCompletedStatus) {
        const today = new Date().toISOString().split('T')[0];
        
        // Update backend
        try {
          await incrementTask(today);
        } catch (err) {
          console.error('Error updating productivity:', err);
        }
        
        addNotification(
          createNotification.success(
            'Task Completed!',
            `You completed "${task.title}"`
          )
        );
        toast.success('Task completed!');
      } else {
        const today = new Date().toISOString().split('T')[0];
        
        // Update backend
        try {
          await decrementTask(today);
        } catch (err) {
          console.error('Error updating productivity:', err);
        }
        
        toast.success('Task marked as incomplete');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      console.error('Error response:', err.response?.data);
      
      // Revert optimistic update on error
      setTasks(
        tasks.map((t) =>
          t.id === id ? task : t
        )
      );
      
      toast.error(err.response?.data?.error || 'Failed to update task');
    }
  };

  const deleteTask = async (id) => {
    console.log('Deleting task with id:', id);
    const task = tasks.find(t => t.id === id);
    console.log('Found task:', task);
    
    if (!id) {
      console.error('Task ID is undefined!');
      toast.error('Cannot delete task: Invalid ID');
      return;
    }
    
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
      
      // Add notification when task is deleted
      if (task) {
        addNotification(
          createNotification.info(
            'Task Deleted',
            `"${task.title}" has been removed`
          )
        );
      }
      toast.success('Task deleted successfully');
    } catch (err) {
      console.error('Error deleting task:', err);
      console.error('Error response:', err.response?.data);
      toast.error(err.response?.data?.error || 'Failed to delete task');
    }
  };

  return (
    <div className="space-y-4">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive text-center">{error}</p>
            <Button onClick={fetchTasks} className="mt-4 mx-auto block">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-base"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>

          {/* Active Tasks List */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <Card>
                <CardHeader>
                  <CardTitle>
                    📋 Active Tasks ({activeTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={parent} className="space-y-2">
                    <AnimatePresence>
                      {activeTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={() => toggleTask(task.id)}
                          onDelete={() => deleteTask(task.id)}
                        />
                      ))}
                    </AnimatePresence>
                    {activeTasks.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8"
                      >
                        <p className="text-muted-foreground">No active tasks</p>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </SortableContext>
          </DndContext>

          {/* Completed Tasks List */}
          {completedTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  ✅ Completed Tasks ({completedTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <AnimatePresence>
                    {completedTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={() => toggleTask(task.id)}
                        onDelete={() => deleteTask(task.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* New Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Task"
      >
        <div className="space-y-4">
          <Input 
            placeholder="Task title" 
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <Textarea 
            placeholder="Task description" 
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <select 
            className="input-base w-full"
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <Button onClick={handleAddTask} className="w-full">
            Create Task
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const TaskItem = ({ task, onToggle, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

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
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={`p-4 border border-border rounded-lg hover:bg-muted/50 transition-all group ${
        isDragging ? 'shadow-lg opacity-50 bg-muted' : 'hover:shadow-md'
      } ${task.completed ? 'bg-muted/30' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <motion.button
          type="button"
          {...attributes}
          {...listeners}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </motion.button>

        {/* Checkbox */}
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="mt-1 transition-colors"
        >
          {task.completed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </motion.div>
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
          )}
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.h4
            className={`font-medium text-sm transition-all ${
              task.completed
                ? 'line-through text-muted-foreground'
                : 'text-foreground'
            }`}
          >
            {task.title}
          </motion.h4>
          <p className="text-sm text-muted-foreground truncate">
            {task.description}
          </p>
        </div>

        {/* Actions */}
        <motion.div 
          className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <motion.span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
              task.priority
            )}`}
            whileHover={{ scale: 1.05 }}
          >
            <Flag className="w-3 h-3" />
            {task.priority}
          </motion.span>
          <motion.button
            onClick={onDelete}
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
            whileTap={{ scale: 0.95 }}
            className="p-1 hover:bg-destructive/10 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

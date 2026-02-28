import api from './api.js';

export const taskService = {
  getTasks: async (filters = {}) => {
    const response = await api.get('/tasks', { params: filters });
    // Handle both array response and object with tasks property
    const tasks = Array.isArray(response.data) ? response.data : (response.data.tasks || []);
    // Normalize task_id to id for frontend consistency
    return tasks.map(task => {
      const normalizedTask = {
        ...task,
        id: task.task_id || task.id,
        completed: task.completed ?? false // Ensure completed has a default value
      };
      // Remove task_id to avoid confusion
      delete normalizedTask.task_id;
      return normalizedTask;
    });
  },

  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    // Backend returns {message, task}, extract just the task
    const task = response.data.task || response.data;
    // Normalize task_id to id
    const normalizedTask = {
      ...task,
      id: task.task_id || task.id
    };
    delete normalizedTask.task_id;
    return normalizedTask;
  },

  updateTask: async (id, taskData) => {
    console.log('Sending update request:', { id, taskData });
    const response = await api.put(`/tasks/${id}`, taskData);
    console.log('Backend update response:', response.data);
    
    // Backend returns {message, task}, but task might be null
    // If task is null, we need to fetch it or construct it from the request
    let task = response.data.task || response.data;
    
    // If backend didn't return the task, construct it from what we know
    if (!task || task === null || !task.id) {
      console.warn('Backend did not return updated task, constructing from request');
      task = {
        id: id,
        ...taskData,
        completed: taskData.completed ?? false
      };
    }
    
    console.log('Task from backend completed status:', task.completed);
    console.log('Expected completed status:', taskData.completed);
    
    // Normalize task_id to id
    const normalizedTask = {
      ...task,
      id: task.task_id || task.id || id,
      completed: task.completed ?? false
    };
    delete normalizedTask.task_id;
    
    console.log('Normalized task completed status:', normalizedTask.completed);
    return normalizedTask;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  completeTask: async (id) => {
    const response = await api.patch(`/tasks/${id}/complete`, {});
    return response.data;
  },

  reorderTasks: async (tasks) => {
    const response = await api.post('/tasks/reorder', { tasks });
    return response.data;
  },
};

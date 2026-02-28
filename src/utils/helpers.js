/**
 * Format date to readable format
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return formatDate(date);
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};

/**
 * Debounce function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Get mood emoji
 */
export const getMoodEmoji = (mood) => {
  const moods = {
    excellent: '😄',
    good: '😊',
    neutral: '😐',
    bad: '😟',
    terrible: '😢',
  };
  // Make it case-insensitive and handle undefined
  const normalizedMood = mood ? mood.toLowerCase().trim() : 'neutral';
  console.log('Getting emoji for mood:', normalizedMood, '-> emoji:', moods[normalizedMood]);
  return moods[normalizedMood] || '😐';
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority) => {
  const colors = {
    high: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    low: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  };
  return colors[priority] || colors.medium;
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (current, target) => {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

/**
 * Get streak status
 */
export const getStreakStatus = (streak) => {
  if (streak === 0) return 'No streak';
  if (streak < 7) return `${streak} ${streak === 1 ? 'day' : 'days'}`;
  if (streak < 30) return `${Math.floor(streak / 7)} weeks`;
  return `${Math.floor(streak / 30)} months`;
};

/**
 * Calculate days until deadline
 */
export const daysUntilDeadline = (deadline) => {
  const now = new Date();
  const target = new Date(deadline);
  const diffTime = Math.abs(target - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get gradient class for card
 */
export const getGradient = (type) => {
  const gradients = {
    primary: 'from-blue-500 to-cyan-500',
    success: 'from-green-500 to-emerald-500',
    warning: 'from-yellow-500 to-orange-500',
    danger: 'from-red-500 to-pink-500',
    purple: 'from-purple-500 to-pink-500',
    indigo: 'from-indigo-500 to-blue-500',
  };
  return `bg-gradient-to-r ${gradients[type] || gradients.primary}`;
};

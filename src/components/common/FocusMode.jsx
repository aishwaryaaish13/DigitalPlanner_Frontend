import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductivity } from '../../context/ProductivityContext.jsx';

export default function FocusMode() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(() => {
    return parseInt(localStorage.getItem('focusSessions') || '0');
  });
  const [showMessage, setShowMessage] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const { incrementFocusSession } = useProductivity();

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleComplete();
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    localStorage.setItem('focusSessions', sessions.toString());
  }, [sessions]);

  const handleComplete = async () => {
    setIsRunning(false);
    setSessions(prev => prev + 1);
    setShowMessage(true);
    playNotification();
    setTimeout(() => setShowMessage(false), 5000);
    
    // Update backend
    try {
      await incrementFocusSession();
    } catch (err) {
      console.error('Error updating focus session:', err);
    }
  };

  const playNotification = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXvzn0pBSh+zPDajzsKElyx6OyrWBQLSKHe8sFuIwUugdDx2Ik2CBhku+zooVARC0yl4fG5ZRwFNo3V7859KQUofsz');
    }
    audioRef.current.play().catch(() => {});
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
    setShowMessage(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white"
        >
          Focus Mode
        </motion.h1>
        
        <div className="text-center mb-8">
          <motion.div
            key={timeLeft}
            initial={{ scale: 1 }}
            animate={{ scale: isRunning && timeLeft % 2 === 0 ? 1.02 : 1 }}
            transition={{ duration: 0.5 }}
            className="text-7xl font-bold text-purple-600 dark:text-purple-400 mb-4"
          >
            {formatTime(timeLeft)}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            Sessions completed: {sessions}
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3 justify-center mb-6"
        >
          {!isRunning ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              Start
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePause}
              className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors"
            >
              Pause
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
          >
            Reset
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg text-center"
            >
              🎉 Great job! You completed a focus session!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

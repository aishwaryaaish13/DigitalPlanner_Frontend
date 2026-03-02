import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ProductivityHeatmap() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    generateHeatmapData();
    
    // Listen for heatmap updates
    const handleHeatmapUpdate = () => {
      generateHeatmapData();
    };
    
    window.addEventListener('heatmapUpdate', handleHeatmapUpdate);
    window.addEventListener('productivityUpdate', handleHeatmapUpdate);
    
    // Initial delay to ensure localStorage is populated
    const timer = setTimeout(() => {
      generateHeatmapData();
    }, 500);
    
    return () => {
      window.removeEventListener('heatmapUpdate', handleHeatmapUpdate);
      window.removeEventListener('productivityUpdate', handleHeatmapUpdate);
      clearTimeout(timer);
    };
  }, []);

  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    
    // Get data from localStorage (no simulation)
    const storedData = JSON.parse(localStorage.getItem('productivityData') || '{}');
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Use stored data or 0 (no random data)
      const taskCount = storedData[dateStr] || 0;
      
      data.push({
        date: dateStr,
        taskCount,
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    
    setHeatmapData(data);
  };

  const getColorClass = (count) => {
    if (count === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (count <= 3) return 'bg-green-200 dark:bg-green-900';
    if (count <= 6) return 'bg-green-400 dark:bg-green-700';
    if (count <= 9) return 'bg-green-600 dark:bg-green-500';
    return 'bg-green-800 dark:bg-green-400';
  };

  const getDayOfWeek = (dateStr) => {
    return new Date(dateStr).getDay();
  };

  // Group days into weeks
  const weeks = [];
  let currentWeek = [];
  
  heatmapData.forEach((day, index) => {
    const dayOfWeek = getDayOfWeek(day.date);
    
    // Fill empty days at the start of first week
    if (index === 0 && dayOfWeek !== 0) {
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push(null);
      }
    }
    
    currentWeek.push(day);
    
    // End of week or last day
    if (dayOfWeek === 6 || index === heatmapData.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 flex flex-col items-center h-full"
    >
      <div className="w-full">
        <motion.h2
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-gray-800 dark:text-white mb-2 text-center"
        >
          Productivity Heatmap
        </motion.h2>
        <motion.p
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-gray-600 dark:text-gray-400 mb-6 text-center"
        >
          Last 30 days of activity
        </motion.p>
      </div>

      <div className="relative flex justify-center w-full flex-1 items-center">
        <div className="flex gap-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-2">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="relative"
                  onMouseEnter={() => day && setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {day ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: (weekIndex * 7 + dayIndex) * 0.01,
                        type: "spring",
                        stiffness: 200
                      }}
                      whileHover={{ scale: 1.15, zIndex: 10 }}
                      className={`w-10 h-10 rounded-lg ${getColorClass(day.taskCount)} 
                        transition-all duration-200 hover:ring-2 hover:ring-blue-500 
                        cursor-pointer shadow-sm`}
                    />
                  ) : (
                    <div className="w-10 h-10" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
              bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 
              whitespace-nowrap shadow-lg z-10 pointer-events-none"
          >
            <div className="font-semibold">{hoveredDay.displayDate}</div>
            <div className="text-gray-300">
              {hoveredDay.taskCount} {hoveredDay.taskCount === 1 ? 'task' : 'tasks'}
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 
              border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-3 mt-6 text-sm text-gray-600 dark:text-gray-400 w-full"
      >
        <span>Less</span>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map((level) => (
            <motion.div
              key={level}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 + level * 0.05 }}
              whileHover={{ scale: 1.3 }}
              className={`w-5 h-5 rounded ${
                level === 0 ? 'bg-gray-200 dark:bg-gray-700' :
                level === 1 ? 'bg-green-200 dark:bg-green-900' :
                level === 2 ? 'bg-green-400 dark:bg-green-700' :
                level === 3 ? 'bg-green-600 dark:bg-green-500' :
                'bg-green-800 dark:bg-green-400'
              }`}
            />
          ))}
        </div>
        <span>More</span>
      </motion.div>
    </motion.div>
  );
}

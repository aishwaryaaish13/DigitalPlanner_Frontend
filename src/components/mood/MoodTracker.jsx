import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Plus, Trash2, Loader2, TrendingUp, Smile, Calendar, Sparkles, Heart } from 'lucide-react';
import { getMoodEmoji } from '../../utils/helpers.js';
import { moodService } from '../../services/moodService.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { createNotification } from '../../utils/notificationHelpers.js';
import toast from 'react-hot-toast';

const moodOptions = [
  { value: 'terrible', label: 'Terrible', description: 'Really struggling' },
  { value: 'bad', label: 'Bad', description: 'Not great' },
  { value: 'neutral', label: 'Neutral', description: 'Just okay' },
  { value: 'good', label: 'Good', description: 'Feeling positive' },
  { value: 'excellent', label: 'Excellent', description: 'Amazing!' }
];

const moodQuotes = [
  "Your feelings are valid. Every emotion is a teacher.",
  "It's okay to not be okay. Tomorrow is a new day.",
  "Emotions are like waves. Let them come and go.",
  "Self-awareness is the first step to emotional wellness.",
  "Your mental health matters. Check in with yourself daily.",
  "Feelings buried alive never die. Express them healthily.",
  "You are not your emotions. You are the observer of them.",
  "Every mood tells a story. Listen to what yours is saying.",
  "Tracking your emotions helps you understand yourself better.",
  "Be kind to yourself, especially on difficult days."
];

export const MoodTracker = () => {
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState('good');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLogging, setIsLogging] = useState(false);
  const [hoveredMood, setHoveredMood] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [currentQuote, setCurrentQuote] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const { addNotification } = useNotifications();

  // Fetch moods on component mount
  useEffect(() => {
    fetchMoods();
    // Set random mood quote
    const randomIndex = Math.floor(Math.random() * moodQuotes.length);
    setQuoteIndex(randomIndex);
    setCurrentQuote(moodQuotes[randomIndex]);
  }, []);

  // Auto-rotate quotes every 11 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => {
        const nextIndex = (prev + 1) % moodQuotes.length;
        setCurrentQuote(moodQuotes[nextIndex]);
        return nextIndex;
      });
    }, 11000); // Change quote every 11 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchMoods = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await moodService.getMoods();
      console.log('Fetched moods raw data:', data);
      // Ensure each mood has a unique ID
      const moodsWithIds = Array.isArray(data) ? data.map((mood, index) => {
        console.log(`Mood ${index}:`, mood);
        console.log(`  - mood value:`, mood.mood);
        console.log(`  - note value:`, mood.note);
        console.log(`  - all keys:`, Object.keys(mood));
        return {
          ...mood,
          id: mood.id || mood.mood_id || `mood-${index}-${Date.now()}`
        };
      }) : [];
      console.log('Processed moods with IDs:', moodsWithIds);
      setMoods(moodsWithIds);
    } catch (err) {
      setError(err.message || 'Failed to fetch moods');
      toast.error('Failed to load mood history');
      console.error('Error fetching moods:', err);
      console.error('Error response:', err.response?.data);
      setMoods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogMood = async () => {
    console.log('Logging mood:', selectedMood);
    try {
      setIsLogging(true);
      const loggedMood = await moodService.logMood({
        mood: selectedMood
      });
      
      console.log('Logged mood response:', loggedMood);
      console.log('Mood value in response:', loggedMood.mood);
      
      // Refetch moods to ensure we have the latest data
      await fetchMoods();
      
      addNotification(
        createNotification.success(
          'Mood Logged',
          `You're feeling ${selectedMood} ${getMoodEmoji(selectedMood)}`
        )
      );
      
      toast.success('Mood logged successfully');
    } catch (err) {
      toast.error('Failed to log mood');
      console.error('Error logging mood:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setIsLogging(false);
    }
  };

  const deleteMood = async (id) => {
    const mood = moods.find(m => m.id === id);
    try {
      await moodService.deleteMood(id);
      
      // Refetch moods to ensure consistency
      await fetchMoods();
      
      if (mood) {
        addNotification(
          createNotification.info('Mood Entry Deleted', 'Mood entry has been removed')
        );
      }
      
      toast.success('Mood entry deleted');
    } catch (err) {
      toast.error('Failed to delete mood');
      console.error('Error deleting mood:', err);
      console.error('Error response:', err.response?.data);
    }
  };

  const getMoodColor = (mood) => {
    const colors = {
      terrible: 'from-red-500 to-pink-500',
      bad: 'from-orange-500 to-red-500',
      neutral: 'from-yellow-500 to-orange-500',
      good: 'from-blue-500 to-cyan-500',
      excellent: 'from-green-500 to-emerald-500',
    };
    // Make it case-insensitive and handle undefined
    const normalizedMood = mood ? mood.toLowerCase().trim() : 'neutral';
    return colors[normalizedMood] || colors.neutral;
  };

  const getMoodStats = () => {
    if (moods.length === 0) return { average: 'neutral', streak: 0, total: 0 };
    
    const moodValues = { terrible: 1, bad: 2, neutral: 3, good: 4, excellent: 5 };
    const total = moods.reduce((sum, m) => sum + (moodValues[m.mood?.toLowerCase()] || 3), 0);
    const avg = total / moods.length;
    
    let averageMood = 'neutral';
    if (avg >= 4.5) averageMood = 'excellent';
    else if (avg >= 3.5) averageMood = 'good';
    else if (avg >= 2.5) averageMood = 'neutral';
    else if (avg >= 1.5) averageMood = 'bad';
    else averageMood = 'terrible';
    
    // Calculate streak of positive moods (good or excellent)
    let streak = 0;
    for (const mood of moods) {
      const moodLower = mood.mood?.toLowerCase();
      if (moodLower === 'good' || moodLower === 'excellent') {
        streak++;
      } else {
        break;
      }
    }
    
    return { average: averageMood, streak, total: moods.length };
  };

  const getMoodDistribution = () => {
    const distribution = { terrible: 0, bad: 0, neutral: 0, good: 0, excellent: 0 };
    moods.forEach(m => {
      const mood = m.mood?.toLowerCase();
      if (distribution.hasOwnProperty(mood)) {
        distribution[mood]++;
      }
    });
    return distribution;
  };

  const stats = getMoodStats();
  const distribution = getMoodDistribution();

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
          <Button onClick={fetchMoods} className="mt-4 mx-auto block">
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
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          >
            <Smile className="w-8 h-8 text-blue-500" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Mood Tracker
          </h1>
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
          >
            <Heart className="w-8 h-8 text-pink-500" />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl"
            animate={{
              scale: [1, 1.12, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, x: -50, rotateY: -90 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: 50, rotateY: 90 }}
              transition={{ 
                duration: 0.8,
                ease: "easeOut"
              }}
              className="relative text-base md:text-lg italic text-muted-foreground font-medium px-6 py-3 bg-card/60 backdrop-blur-sm rounded-xl border-2 border-purple-500/30 shadow-lg"
            >
              <motion.span
                className="inline-flex items-center gap-2"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundImage: 'linear-gradient(90deg, currentColor 0%, #3b82f6 25%, #8b5cf6 50%, #ec4899 75%, currentColor 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                }}
              >
                <Heart className="w-4 h-4 text-pink-500" />
                "{currentQuote}"
                <Sparkles className="w-4 h-4 text-purple-500" />
              </motion.span>
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Stats Dashboard */}
      {showStats && moods.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-3 bg-gradient-to-br ${getMoodColor(stats.average)} rounded-lg`}>
                  <Smile className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Mood</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getMoodEmoji(stats.average)}</span>
                    <p className="text-lg font-bold capitalize">{stats.average}</p>
                  </div>
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
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Positive Streak</p>
                  <p className="text-2xl font-bold">{stats.streak} days</p>
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
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Log Mood */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">How are you feeling?</CardTitle>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Mood Display */}
          <motion.div
            key={selectedMood}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-6 rounded-xl bg-gradient-to-br ${getMoodColor(selectedMood)} text-white text-center`}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="text-6xl mb-2"
            >
              {getMoodEmoji(selectedMood)}
            </motion.div>
            <p className="text-xl font-bold capitalize">{selectedMood}</p>
            <p className="text-sm opacity-90">
              {moodOptions.find(m => m.value === selectedMood)?.description}
            </p>
          </motion.div>

          {/* Mood Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Select your mood:</p>
            <div className="grid grid-cols-5 gap-2">
              {moodOptions.map((mood, index) => (
                <motion.button
                  key={mood.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.15, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(mood.value)}
                  onMouseEnter={() => setHoveredMood(mood.value)}
                  onMouseLeave={() => setHoveredMood(null)}
                  className={`p-3 rounded-xl text-3xl transition-all relative ${
                    selectedMood === mood.value
                      ? 'ring-4 ring-primary shadow-lg scale-110'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <motion.div
                    animate={selectedMood === mood.value ? { rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5, repeat: selectedMood === mood.value ? Infinity : 0, repeatDelay: 2 }}
                  >
                    {getMoodEmoji(mood.value)}
                  </motion.div>
                  {hoveredMood === mood.value && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap bg-popover text-popover-foreground px-2 py-1 rounded shadow-lg z-10"
                    >
                      {mood.label}
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleLogMood} 
              className="w-full"
              disabled={isLogging}
            >
              {isLogging ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Mood
                </>
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      {/* Mood History */}
      <div className="lg:col-span-2 space-y-4">
        {/* Mood Distribution Chart */}
        {moods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mood Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {moodOptions.map((mood) => {
                  const count = distribution[mood.value] || 0;
                  const percentage = moods.length > 0 ? (count / moods.length) * 100 : 0;
                  return (
                    <motion.div
                      key={mood.value}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getMoodEmoji(mood.value)}</span>
                          <span className="capitalize font-medium">{mood.value}</span>
                        </div>
                        <span className="text-muted-foreground">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className={`h-full bg-gradient-to-r ${getMoodColor(mood.value)}`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* History List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent History ({moods.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-auto">
              {moods.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    😊
                  </motion.div>
                  <p className="text-sm text-muted-foreground">
                    No mood entries yet. Log your first mood!
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {moods.slice(0, 10).map((entry, index) => {
                    console.log(`Rendering mood entry ${index}:`, entry);
                    console.log(`  - Has note? ${!!entry.note}`);
                    console.log(`  - Note value:`, entry.note);
                    return (
                      <motion.div
                        key={entry.id || `mood-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className={`p-4 rounded-xl bg-gradient-to-r ${getMoodColor(
                          entry.mood
                        )} bg-opacity-10 border-2 border-current border-opacity-20 flex items-start justify-between group relative overflow-hidden`}
                      >
                        {/* Animated background */}
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-r ${getMoodColor(entry.mood)} opacity-0 group-hover:opacity-10 transition-opacity`}
                        />
                        
                        <div className="flex-1 relative z-10">
                          <div className="flex items-center gap-3 mb-1">
                            <motion.span
                              className="text-3xl"
                              whileHover={{ scale: 1.2, rotate: 10 }}
                            >
                              {getMoodEmoji(entry.mood)}
                            </motion.span>
                            <div>
                              <span className="font-bold text-base capitalize">
                                {entry.mood}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {new Date(entry.date || entry.created_at).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <motion.button
                          onClick={() => deleteMood(entry.id)}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 rounded-lg transition-all relative z-10"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </motion.button>
                      </motion.div>
                  );
                  })}
                </AnimatePresence>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

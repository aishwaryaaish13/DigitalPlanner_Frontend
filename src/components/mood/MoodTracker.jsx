import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { getMoodEmoji } from '../../utils/helpers.js';
import { moodService } from '../../services/moodService.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { createNotification } from '../../utils/notificationHelpers.js';
import toast from 'react-hot-toast';

const moodOptions = ['terrible', 'bad', 'neutral', 'good', 'excellent'];

export const MoodTracker = () => {
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState('good');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLogging, setIsLogging] = useState(false);
  const { addNotification } = useNotifications();

  // Fetch moods on component mount
  useEffect(() => {
    fetchMoods();
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Log Mood */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Log Mood</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map((mood) => (
              <motion.button
                key={mood}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMood(mood)}
                className={`p-3 rounded-lg text-2xl transition-all ${
                  selectedMood === mood
                    ? 'ring-2 ring-primary scale-110'
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                {getMoodEmoji(mood)}
              </motion.button>
            ))}
          </div>

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
        </CardContent>
      </Card>

      {/* Mood History */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">History ({moods.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-auto">
              {moods.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No mood entries yet. Log your first mood!
                </p>
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
                        className={`p-4 rounded-lg bg-gradient-to-r ${getMoodColor(
                          entry.mood
                        )} bg-opacity-10 border border-current border-opacity-20 flex items-start justify-between group`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">
                              {getMoodEmoji(entry.mood)}
                            </span>
                            <span className="font-medium text-sm capitalize">
                              {entry.mood}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.date || entry.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteMood(entry.id)}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
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
  );
};

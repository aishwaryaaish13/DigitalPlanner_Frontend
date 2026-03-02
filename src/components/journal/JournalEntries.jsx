import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Textarea } from '../common/Textarea.jsx';
import { AIAssistant } from '../common/AIAssistant.jsx';
import { Plus, Trash2, Loader2, Edit2, Sparkles, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { formatDate } from '../../utils/helpers.js';
import { journalService } from '../../services/journalService.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { createNotification } from '../../utils/notificationHelpers.js';
import toast from 'react-hot-toast';

const writingPrompts = [
  "What made you smile today?",
  "Describe a challenge you overcame recently.",
  "What are you grateful for right now?",
  "What's on your mind?",
  "How are you feeling today?",
  "What did you learn today?",
  "What's something you're looking forward to?",
  "Reflect on a meaningful conversation you had.",
];

export const JournalEntries = () => {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({ content: '', mood: '😊' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [writingTime, setWritingTime] = useState(0);
  const [isWriting, setIsWriting] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const { addNotification } = useNotifications();
  const timerRef = useRef(null);
  const lastContentRef = useRef('');

  // Fetch entries on component mount
  useEffect(() => {
    fetchEntries();
    // Set random prompt on mount
    setCurrentPrompt(writingPrompts[Math.floor(Math.random() * writingPrompts.length)]);
  }, []);

  // Word count and writing timer
  useEffect(() => {
    const content = isEditing ? editedEntry?.content : newEntry.content;
    const words = content?.trim().split(/\s+/).filter(Boolean).length || 0;
    setWordCount(words);

    // Start timer when user starts typing
    if (content && content !== lastContentRef.current) {
      if (!isWriting) {
        setIsWriting(true);
      }
      lastContentRef.current = content;
    }
  }, [newEntry.content, editedEntry?.content, isEditing, isWriting]);

  // Writing timer
  useEffect(() => {
    if (isWriting) {
      timerRef.current = setInterval(() => {
        setWritingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isWriting]);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await journalService.getEntries();
      console.log('Fetched journal entries:', data);
      
      // Ensure we have an array
      const entriesArray = Array.isArray(data) ? data : [];
      console.log('Setting entries:', entriesArray);
      
      setEntries(entriesArray);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to fetch journal entries';
      setError(errorMessage);
      
      // Only show toast if it's not a network error (backend might be down)
      if (!err.message?.includes('Network Error')) {
        toast.error('Failed to load journal entries');
      }
      
      console.error('Error fetching entries:', err);
      console.error('Error response:', err.response?.data);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    console.log('Creating entry with mood:', newEntry.mood);
    console.log('Full newEntry object:', newEntry);

    try {
      setIsSaving(true);
      const createdEntry = await journalService.createEntry(newEntry);
      console.log('Created entry response:', createdEntry);
      console.log('Created entry mood:', createdEntry.mood);
      
      // Refetch entries to ensure we have the latest data
      await fetchEntries();
      
      setNewEntry({ content: '', mood: '😊' });
      setWritingTime(0);
      setIsWriting(false);
      lastContentRef.current = '';
      
      // Get new prompt
      setCurrentPrompt(writingPrompts[Math.floor(Math.random() * writingPrompts.length)]);
      
      addNotification(
        createNotification.success('Journal Entry Saved', 'Your entry has been saved')
      );
      
      toast.success('Entry saved successfully');
    } catch (err) {
      toast.error('Failed to save entry');
      console.error('Error creating entry:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    const entry = entries.find(e => e.id === id);
    try {
      await journalService.deleteEntry(id);
      
      // Refetch entries to ensure consistency
      await fetchEntries();
      
      setSelectedEntry(null);
      setIsEditing(false);
      setEditedEntry(null);
      
      if (entry) {
        addNotification(
          createNotification.info('Journal Entry Deleted', 'Entry has been removed')
        );
      }
      
      toast.success('Entry deleted successfully');
    } catch (err) {
      toast.error('Failed to delete entry');
      console.error('Error deleting entry:', err);
      console.error('Error response:', err.response?.data);
    }
  };

  const handleEditEntry = () => {
    setIsEditing(true);
    setEditedEntry({
      content: selectedEntry.content,
      mood: selectedEntry.mood || '😊'
    });
    setWritingTime(0);
    setIsWriting(false);
    lastContentRef.current = selectedEntry.content;
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedEntry(null);
    setWritingTime(0);
    setIsWriting(false);
    lastContentRef.current = '';
  };

  const handleUpdateEntry = async () => {
    console.log('Starting update...');
    console.log('editedEntry:', editedEntry);
    console.log('selectedEntry.id:', selectedEntry?.id);
    
    if (!editedEntry || !editedEntry.content || !editedEntry.content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    try {
      setIsSaving(true);
      console.log('Calling updateEntry API with:', selectedEntry.id, editedEntry);
      
      const updatedEntry = await journalService.updateEntry(selectedEntry.id, editedEntry);
      console.log('Update response:', updatedEntry);
      
      // Refetch entries to get updated data
      await fetchEntries();
      
      // Update the selected entry with the new data
      setSelectedEntry({
        ...selectedEntry,
        content: editedEntry.content,
        mood: editedEntry.mood
      });
      
      setIsEditing(false);
      setEditedEntry(null);
      setWritingTime(0);
      setIsWriting(false);
      lastContentRef.current = '';
      
      addNotification(
        createNotification.success('Journal Entry Updated', 'Your entry has been updated')
      );
      
      toast.success('Entry updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to update entry');
      console.error('Error updating entry:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWritingStreak = () => {
    if (entries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date || b.created_at) - new Date(a.date || a.created_at)
    );
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date || sortedEntries[i].created_at);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
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
          <Button onClick={fetchEntries} className="mt-4 mx-auto block">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{entries.length}</p>
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
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Writing Streak</p>
                <p className="text-2xl font-bold">{getWritingStreak()} days</p>
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
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Writing Time</p>
                <p className="text-2xl font-bold">{formatTime(writingTime)}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Entries ({entries.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-auto">
                {entries.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      No entries yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Start your journaling journey
                    </p>
                  </motion.div>
                ) : (
                  entries.map((entry, index) => (
                    <motion.button
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedEntry?.id === entry.id
                          ? 'bg-primary/10 ring-2 ring-primary/20'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <motion.span
                          className="text-lg"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                        >
                          {entry.mood || '😊'}
                        </motion.span>
                        <p className="font-medium text-sm line-clamp-1 flex-1">
                          {entry.content?.substring(0, 30) || 'No content'}...
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.date || entry.created_at)}
                      </p>
                    </motion.button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entry Editor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:col-span-2 space-y-4"
        >
        {selectedEntry ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Journal Entry</CardTitle>
                {isEditing && editedEntry ? (
                  <div className="flex gap-2">
                    {['😊', '😐', '😕', '😄', '😢'].map((mood) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() =>
                          setEditedEntry({ ...editedEntry, mood })
                        }
                        className={`p-2 rounded-lg text-2xl transition-colors ${
                          editedEntry.mood === mood
                            ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-2xl">{selectedEntry.mood}</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {formatDate(selectedEntry.date || selectedEntry.created_at)}
              </p>
              
              {isEditing && editedEntry ? (
                <>
                  {/* Word count and timer for editing */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{wordCount}</span> words
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(writingTime)}</span>
                    </div>
                  </div>

                  <Textarea
                    value={editedEntry.content}
                    onChange={(e) =>
                      setEditedEntry({ ...editedEntry, content: e.target.value })
                    }
                    placeholder="Write your journal entry..."
                    rows={10}
                    className="resize-none"
                  />
                    rows={10}
                  />
                  
                  <AIAssistant type="journal" text={editedEntry.content} />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateEntry}
                      className="flex-1"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Entry'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedEntry.content}</p>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleEditEntry}
                      className="flex-1"
                    >
                      Edit Entry
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteEntry(selectedEntry.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>New Entry</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPrompts(!showPrompts)}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {showPrompts ? 'Hide' : 'Show'} Prompts
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Writing Prompt */}
              <AnimatePresence>
                {showPrompts && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">Writing Prompt</p>
                          <p className="text-sm text-muted-foreground italic">{currentPrompt}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPrompt(writingPrompts[Math.floor(Math.random() * writingPrompts.length)])}
                        >
                          New
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mood Selector */}
              <div>
                <p className="text-sm font-medium mb-2">How are you feeling?</p>
                <div className="flex gap-2">
                  {['😊', '😐', '😕', '😄', '😢', '😌', '😤', '🥰'].map((mood) => (
                    <motion.button
                      key={mood}
                      type="button"
                      onClick={() => setNewEntry({ ...newEntry, mood })}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-2 rounded-lg text-2xl transition-all ${
                        newEntry.mood === mood
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary shadow-lg'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {mood}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Word count and timer */}
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-sm">
                  <motion.div
                    className="flex items-center gap-1 text-muted-foreground"
                    animate={{ scale: wordCount > 0 ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="font-medium text-primary">{wordCount}</span> words
                  </motion.div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(writingTime)}</span>
                  </div>
                  {wordCount >= 50 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1 text-green-500 text-xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      Great progress!
                    </motion.div>
                  )}
                </div>
                
                {/* Progress bar */}
                {wordCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    className="h-1.5 bg-muted rounded-full overflow-hidden"
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-primary/60"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((wordCount / 100) * 100, 100)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                )}
              </div>

              <div className="relative">
                <Textarea
                  placeholder="Start writing your thoughts..."
                  value={newEntry.content}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, content: e.target.value })
                  }
                  rows={10}
                  className="resize-none"
                />
                {newEntry.content.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-16 left-4 text-muted-foreground/50 text-sm pointer-events-none"
                  >
                    💭 Let your thoughts flow...
                  </motion.div>
                )}
              </div>

              <AIAssistant type="journal" text={newEntry.content} />

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button 
                  onClick={handleAddEntry} 
                  className="w-full"
                  disabled={isSaving || !newEntry.content.trim()}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Save Entry
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        )}
        </motion.div>
      </div>
    </div>
  );
};

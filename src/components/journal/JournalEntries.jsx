import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Textarea } from '../common/Textarea.jsx';
import { AIAssistant } from '../common/AIAssistant.jsx';
import { Plus, Trash2, Loader2, Edit2 } from 'lucide-react';
import { formatDate } from '../../utils/helpers.js';
import { journalService } from '../../services/journalService.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { createNotification } from '../../utils/notificationHelpers.js';
import toast from 'react-hot-toast';

export const JournalEntries = () => {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({ content: '', mood: '😊' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState(null);
  const { addNotification } = useNotifications();

  // Fetch entries on component mount
  useEffect(() => {
    fetchEntries();
  }, []);

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
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedEntry(null);
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
                <p className="text-sm text-muted-foreground text-center py-4">
                  No entries yet
                </p>
              ) : (
                entries.map((entry) => (
                  <motion.button
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    whileHover={{ x: 4 }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedEntry?.id === entry.id
                        ? 'bg-primary/10'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{entry.mood || '😊'}</span>
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
                  <Textarea
                    value={editedEntry.content}
                    onChange={(e) =>
                      setEditedEntry({ ...editedEntry, content: e.target.value })
                    }
                    placeholder="Write your journal entry..."
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
              <CardTitle>New Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {['😊', '😐', '😕', '😄', '😢'].map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() =>
                      setNewEntry({ ...newEntry, mood })
                    }
                    className={`p-2 rounded-lg text-2xl transition-colors ${
                      newEntry.mood === mood
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>

              <Textarea
                placeholder="Write your journal entry..."
                value={newEntry.content}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, content: e.target.value })
                }
                rows={10}
              />

              <AIAssistant type="journal" text={newEntry.content} />

              <Button 
                onClick={handleAddEntry} 
                className="w-full"
                disabled={isSaving}
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
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

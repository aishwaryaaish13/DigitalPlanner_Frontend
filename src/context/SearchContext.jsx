import React, { createContext, useState, useCallback, useMemo } from 'react';
import { CheckSquare, Target, BookOpen, Smile, TrendingUp } from 'lucide-react';

const SearchContext = createContext();

export { SearchContext };

// This would normally come from your actual data stores
const getSearchableData = () => [
  // Tasks
  { id: 't1', type: 'task', title: 'Complete project report', description: 'Finish Q1 project report', category: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { id: 't2', type: 'task', title: 'Review code', description: 'Review PR #245', category: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { id: 't3', type: 'task', title: 'Team meeting', description: 'Weekly sync with team', category: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { id: 't4', type: 'task', title: 'Update documentation', description: 'Update API documentation', category: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { id: 't5', type: 'task', title: 'Fix bug in login', description: 'Fix authentication issue', category: 'Tasks', icon: CheckSquare, path: '/tasks' },
  
  // Goals
  { id: 'g1', type: 'goal', title: 'Read 12 Books', description: 'Read one book per month', category: 'Goals', icon: Target, path: '/goals' },
  { id: 'g2', type: 'goal', title: 'Fitness Goal', description: 'Exercise 3 times per week', category: 'Goals', icon: Target, path: '/goals' },
  { id: 'g3', type: 'goal', title: 'Learn Spanish', description: 'Practice Spanish daily', category: 'Goals', icon: Target, path: '/goals' },
  { id: 'g4', type: 'goal', title: 'Save Money', description: 'Save $10,000 this year', category: 'Goals', icon: Target, path: '/goals' },
  
  // Journal
  { id: 'j1', type: 'journal', title: 'Morning Reflection', description: 'Today was a productive day...', category: 'Journal', icon: BookOpen, path: '/journal' },
  { id: 'j2', type: 'journal', title: 'Evening Thoughts', description: 'Grateful for the progress made...', category: 'Journal', icon: BookOpen, path: '/journal' },
  { id: 'j3', type: 'journal', title: 'Weekend Plans', description: 'Planning a relaxing weekend...', category: 'Journal', icon: BookOpen, path: '/journal' },
  
  // Habits
  { id: 'h1', type: 'habit', title: 'Morning Exercise', description: 'Daily workout routine', category: 'Habits', icon: TrendingUp, path: '/habits' },
  { id: 'h2', type: 'habit', title: 'Read for 30 minutes', description: 'Daily reading habit', category: 'Habits', icon: TrendingUp, path: '/habits' },
  { id: 'h3', type: 'habit', title: 'Meditation', description: '10 minutes of meditation', category: 'Habits', icon: TrendingUp, path: '/habits' },
  { id: 'h4', type: 'habit', title: 'Drink Water', description: '8 glasses of water daily', category: 'Habits', icon: TrendingUp, path: '/habits' },
  
  // Mood
  { id: 'm1', type: 'mood', title: 'Happy Mood', description: 'Feeling great today', category: 'Mood', icon: Smile, path: '/mood' },
  { id: 'm2', type: 'mood', title: 'Productive Day', description: 'Accomplished a lot', category: 'Mood', icon: Smile, path: '/mood' },
];

export const SearchContextProvider = ({ children }) => {
  const [recentSearches, setRecentSearches] = useState([
    'project report',
    'fitness',
    'morning',
  ]);

  const searchableData = useMemo(() => getSearchableData(), []);

  const search = useCallback((query) => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return searchableData.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery)
    );
  }, [searchableData]);

  const addRecentSearch = useCallback((query) => {
    if (!query.trim()) return;
    
    setRecentSearches((prev) => {
      const filtered = prev.filter((q) => q !== query);
      return [query, ...filtered].slice(0, 5);
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const removeRecentSearch = useCallback((query) => {
    setRecentSearches((prev) => prev.filter((q) => q !== query));
  }, []);

  return (
    <SearchContext.Provider
      value={{
        search,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        removeRecentSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

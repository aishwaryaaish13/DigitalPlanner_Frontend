import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock } from 'lucide-react';
import { Card } from './Card.jsx';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch.js';

export const SearchPanel = ({ isOpen, onClose, initialQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  
  const {
    search,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    removeRecentSearch,
  } = useSearch();

  useEffect(() => {
    if (searchQuery.trim()) {
      const searchResults = search(searchQuery);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [searchQuery, search]);

  const handleResultClick = (result) => {
    // Add to recent searches
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
    }
    
    // Navigate to the result's page
    navigate(result.path);
    onClose();
  };

  const handleRecentSearchClick = (query) => {
    setSearchQuery(query);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Tasks':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'Goals':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'Journal':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'Habits':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'Mood':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl mx-4"
          >
            <Card className="shadow-2xl border-2">
              {/* Search Input */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search tasks, goals, journal entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="flex-1 bg-transparent outline-none text-base"
                  />
                  {searchQuery && (
                    <motion.button
                      onClick={() => setSearchQuery('')}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                  <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-semibold bg-muted rounded">
                    ESC
                  </kbd>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[500px] overflow-y-auto">
                {searchQuery.trim() ? (
                  results.length > 0 ? (
                    <div className="p-2">
                      <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                        Results ({results.length})
                      </p>
                      <AnimatePresence>
                        {results.map((result, index) => (
                          <motion.button
                            key={result.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => handleResultClick(result)}
                            whileHover={{ backgroundColor: 'var(--muted)' }}
                            className="w-full p-3 rounded-lg text-left transition-colors group"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${getCategoryColor(result.category)}`}>
                                <result.icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm font-semibold truncate">
                                    {result.title}
                                  </h4>
                                  <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(result.category)}`}>
                                    {result.category}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {result.description}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-8 text-center"
                    >
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                        <Search className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No results found for "{searchQuery}"
                      </p>
                    </motion.div>
                  )
                ) : (
                  // Recent Searches
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Recent Searches
                      </p>
                      {recentSearches.length > 0 && (
                        <motion.button
                          onClick={clearRecentSearches}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Clear
                        </motion.button>
                      )}
                    </div>
                    {recentSearches.length > 0 ? (
                      <div className="space-y-1">
                        {recentSearches.map((query, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleRecentSearchClick(query)}
                            whileHover={{ backgroundColor: 'var(--muted)' }}
                            className="w-full p-2 rounded-lg text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
                          >
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {query}
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No recent searches
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border bg-muted/30">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-background rounded border">↑</kbd>
                      <kbd className="px-1.5 py-0.5 bg-background rounded border">↓</kbd>
                      to navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-background rounded border">↵</kbd>
                      to select
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background rounded border">ESC</kbd>
                    to close
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

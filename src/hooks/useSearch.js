import { useContext } from 'react';
import { SearchContext } from '../context/SearchContext.jsx';

export const useSearch = () => {
  const context = useContext(SearchContext);
  
  if (!context) {
    throw new Error('useSearch must be used within SearchContextProvider');
  }
  
  return context;
};

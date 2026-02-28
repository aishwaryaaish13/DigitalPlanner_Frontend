import { useEffect, useState } from 'react';

// Custom hook to trigger re-renders when localStorage changes
export const useProductivityRefresh = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
    };

    // Listen for custom event
    window.addEventListener('productivityUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('productivityUpdate', handleStorageChange);
    };
  }, []);

  return refreshKey;
};

// Dispatch event when productivity data changes
export const triggerProductivityUpdate = () => {
  window.dispatchEvent(new Event('productivityUpdate'));
};

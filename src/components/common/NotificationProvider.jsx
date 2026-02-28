import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useApp } from '../../hooks/useApp.js';

export const NotificationProvider = () => {
  const { theme } = useApp();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background:
            theme === 'dark'
              ? 'hsl(var(--card))'
              : 'hsl(var(--background))',
          color:
            theme === 'dark'
              ? 'hsl(var(--card-foreground))'
              : 'hsl(var(--foreground))',
          border: `1px solid hsl(var(--border))`,
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: 'white',
          },
        },
        loading: {
          iconTheme: {
            primary: '#f59e0b',
            secondary: 'white',
          },
        },
      }}
    />
  );
};

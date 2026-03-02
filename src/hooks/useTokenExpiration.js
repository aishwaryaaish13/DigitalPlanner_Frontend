import { useEffect, useState } from 'react';
import { useAuth } from './useAuth.js';
import { authService } from '../services/authService.js';
import toast from 'react-hot-toast';

export const useTokenExpiration = () => {
  const { logout } = useAuth();
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(null);
  const [hasShownWarning, setHasShownWarning] = useState(false);

  useEffect(() => {
    const checkExpiration = () => {
      const expiresAt = authService.getTokenExpirationTime();
      
      if (!expiresAt) {
        setTimeUntilExpiry(null);
        return;
      }

      const timeLeft = expiresAt - Date.now();
      setTimeUntilExpiry(timeLeft);

      // Token expired
      if (timeLeft <= 0) {
        toast.error('Your session has expired. Please login again.');
        logout();
        return;
      }

      // Show warning 5 minutes before expiration (only once)
      if (timeLeft < 5 * 60 * 1000 && !hasShownWarning) {
        const minutesLeft = Math.ceil(timeLeft / (60 * 1000));
        toast.error(
          `Your session will expire in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}. Please save your work.`,
          { duration: 10000 }
        );
        setHasShownWarning(true);
      }
    };

    // Check immediately
    checkExpiration();

    // Check every 30 seconds
    const interval = setInterval(checkExpiration, 30 * 1000);

    return () => clearInterval(interval);
  }, [logout, hasShownWarning]);

  return {
    timeUntilExpiry,
    isExpiringSoon: timeUntilExpiry && timeUntilExpiry < 30 * 60 * 1000, // Less than 30 minutes
  };
};

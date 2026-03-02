import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import { useTokenExpiration } from '../../hooks/useTokenExpiration.js';

export const SessionTimeout = () => {
  const { timeUntilExpiry, isExpiringSoon } = useTokenExpiration();

  if (!isExpiringSoon || !timeUntilExpiry) return null;

  const minutesLeft = Math.ceil(timeUntilExpiry / (60 * 1000));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-50 max-w-sm"
      >
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-500 mb-1">
                Session Expiring Soon
              </h3>
              <p className="text-xs text-muted-foreground">
                Your session will expire in {minutesLeft} minute{minutesLeft !== 1 ? 's' : ''}. 
                Please save your work.
              </p>
            </div>
            <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

import React from 'react';
import { motion } from 'framer-motion';

export const Textarea = React.forwardRef(
  ({ className = '', disabled, ...props }, ref) => {
    return (
      <motion.textarea
        ref={ref}
        disabled={disabled}
        whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
        transition={{ duration: 0.2 }}
        className={`
          flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all
          ${disabled ? 'opacity-50' : ''}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

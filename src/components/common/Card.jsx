import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export const Card = React.forwardRef(
  ({ className = '', children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
        transition={{ duration: 0.2 }}
        className={`card-base transition-shadow duration-200 ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ className = '', children }) => (
  <div className={`p-6 border-b border-border ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ className = '', children }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export const CardFooter = ({ className = '', children }) => (
  <div className={`p-6 border-t border-border flex gap-2 justify-end ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ className = '', children }) => (
  <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>
);

export const CardDescription = ({ className = '', children }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

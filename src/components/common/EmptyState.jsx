import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export const EmptyState = ({
  icon: Icon,
  title = 'No data',
  description = 'Get started by creating your first item',
  action,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      {Icon && (
        <motion.div 
          className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          whileHover={{ 
            scale: 1.1, 
            rotate: 360,
            transition: { duration: 0.5 }
          }}
        >
          <Icon className="w-8 h-8 text-muted-foreground" />
        </motion.div>
      )}
      <motion.h3 
        className="text-lg font-semibold mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {title}
      </motion.h3>
      <motion.p 
        className="text-sm text-muted-foreground mb-6 max-w-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {description}
      </motion.p>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};

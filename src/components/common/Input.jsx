import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export const Input = React.forwardRef(
  ({
    type = 'text',
    placeholder,
    className = '',
    disabled,
    ...props
  },
    ref
  ) => {
    return (
      <motion.input
        ref={ref}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        whileFocus={{ scale: 1.02, boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
        transition={{ duration: 0.2 }}
        className={`
          input-base
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          transition-all duration-200
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

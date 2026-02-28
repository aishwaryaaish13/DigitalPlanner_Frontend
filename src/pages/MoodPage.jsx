import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Header } from '../components/common/Header.jsx';
import { MoodTracker } from '../components/mood/MoodTracker.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const MoodPage = () => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Header title="Mood Tracker" />

      <div className="px-6 py-4">
        <MoodTracker />
      </div>
    </motion.div>
  );
};

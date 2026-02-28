import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Header } from '../components/common/Header.jsx';
import { GoalsList } from '../components/goals/GoalsList.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const GoalsPage = () => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Header title="Goals" />

      <div className="px-6 py-4">
        <GoalsList />
      </div>
    </motion.div>
  );
};

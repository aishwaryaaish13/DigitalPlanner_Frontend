import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Header } from '../components/common/Header.jsx';
import { SummaryCards } from '../components/dashboard/SummaryCards.jsx';
import { DashboardCharts } from '../components/dashboard/DashboardCharts.jsx';
import FocusMode from '../components/common/FocusMode.jsx';
import StreakTracker from '../components/common/StreakTracker.jsx';
import ProductivityHeatmap from '../components/common/ProductivityHeatmap.jsx';
import AchievementBadges from '../components/common/AchievementBadges.jsx';
import MiniAnalytics from '../components/common/MiniAnalytics.jsx';
import DailySummary from '../components/common/DailySummary.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const Dashboard = () => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Header title="Dashboard" showSearch={true} />

      <div className="px-6 py-4 space-y-6">
        {/* Summary Cards */}
        <SummaryCards />

        {/* Daily Summary */}
        <DailySummary />

        {/* Charts */}
        <DashboardCharts />

        {/* Mini Analytics */}
        <MiniAnalytics />

        {/* Productivity Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <ProductivityHeatmap />
          </div>
          <StreakTracker />
          <div className="lg:col-span-2">
            <FocusMode />
          </div>
        </div>

        {/* Achievement Badges */}
        <AchievementBadges />
      </div>
    </motion.div>
  );
};

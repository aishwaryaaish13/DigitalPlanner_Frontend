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
import { Sparkles } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0 },
};

const sectionVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export const Dashboard = () => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5"
    >
      <Header title="Dashboard" showSearch={true} />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.03, 0.05, 0.03]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.03, 0.05, 0.03]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative px-4 md:px-6 py-6 max-w-[1600px] mx-auto space-y-6">
        {/* Welcome Banner */}
        <motion.div
          variants={sectionVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 p-6 border border-primary/20 backdrop-blur-sm"
        >
          <motion.div
            animate={{
              x: [0, 100, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-2xl"
          />
          <div className="relative flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Welcome Back! 🎯
              </h2>
              <p className="text-sm text-muted-foreground">Here's your productivity overview</p>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={sectionVariants}>
          <SummaryCards />
        </motion.div>

        {/* Daily Summary */}
        <motion.div variants={sectionVariants}>
          <DailySummary />
        </motion.div>

        {/* Charts Grid */}
        <motion.div variants={sectionVariants}>
          <DashboardCharts />
        </motion.div>

        {/* Streak & Achievements */}
        <motion.div 
          variants={sectionVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <StreakTracker />
          <AchievementBadges />
        </motion.div>

        {/* Mini Analytics */}
        <motion.div variants={sectionVariants}>
          <MiniAnalytics />
        </motion.div>

        {/* Heatmap & Focus Mode */}
        <motion.div 
          variants={sectionVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <ProductivityHeatmap />
          <FocusMode />
        </motion.div>
      </div>
    </motion.div>
  );
};

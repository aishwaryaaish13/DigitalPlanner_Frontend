import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';
import { Sidebar } from './components/common/Sidebar.jsx';
import { NotificationProvider } from './components/common/NotificationProvider.jsx';
import { Skeleton } from './components/common/Skeleton.jsx';

// Pages
import { Login } from './pages/Login.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { PaymentPage } from './pages/PaymentPage.jsx';
const Dashboard = lazy(() => import('./pages/Dashboard.jsx').then(m => ({ default: m.Dashboard })));
const CalendarPage = lazy(() => import('./pages/CalendarPage.jsx').then(m => ({ default: m.CalendarPage })));
const TasksPage = lazy(() => import('./pages/TasksPage.jsx').then(m => ({ default: m.TasksPage })));
const JournalPage = lazy(() => import('./pages/JournalPage.jsx').then(m => ({ default: m.JournalPage })));
const GoalsPage = lazy(() => import('./pages/GoalsPage.jsx').then(m => ({ default: m.GoalsPage })));
const MoodPage = lazy(() => import('./pages/MoodPage.jsx').then(m => ({ default: m.MoodPage })));
const HabitPage = lazy(() => import('./pages/HabitPage.jsx').then(m => ({ default: m.HabitPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx').then(m => ({ default: m.ProfilePage })));

const PageLoader = () => (
  <div className="flex-1 p-6 space-y-4">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-64" />
    <Skeleton className="h-40" />
  </div>
);

export const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/payment" element={<PaymentPage />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-background">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content - Add padding on mobile for hamburger button */}
                <main className="flex-1 overflow-auto w-full pt-16 lg:pt-0">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/tasks" element={<TasksPage />} />
                      <Route path="/journal" element={<JournalPage />} />
                      <Route path="/goals" element={<GoalsPage />} />
                      <Route path="/mood" element={<MoodPage />} />
                      <Route path="/habits" element={<HabitPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                    </Routes>
                  </Suspense>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Toast Notifications */}
      <NotificationProvider />
    </Router>
  );
};

export default App;

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  CheckSquare,
  BookOpen,
  Target,
  Smile,
  Flame,
  LogOut,
  Menu,
  X,
  UserCircle,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle.jsx';

const menuItems = [
  { label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
  { label: 'Calendar', icon: Calendar, path: '/calendar' },
  { label: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { label: 'Journal', icon: BookOpen, path: '/journal' },
  { label: 'Goals', icon: Target, path: '/goals' },
  { label: 'Mood', icon: Smile, path: '/mood' },
  { label: 'Habits', icon: Flame, path: '/habits' },
  { label: 'Profile', icon: UserCircle, path: '/profile' },
];

export const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = React.useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    closeMobileMenu();
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg shadow-lg hover:bg-muted transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Overlay - Only on mobile when menu is open */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          h-screen w-64 bg-card border-r border-border flex flex-col shadow-lg
          fixed top-0 left-0 z-40
          transition-transform duration-300 ease-in-out
          lg:sticky lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">MindTrack</h1>
              <p className="text-xs text-muted-foreground">Digital Planner</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left relative overflow-hidden"
            >
              {hoveredItem === item.path && (
                <motion.div
                  layoutId="sidebar-hover"
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              <item.icon className="w-5 h-5 relative z-10" />
              <span className="font-medium text-sm relative z-10">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-3">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

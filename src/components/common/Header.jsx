import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { Bell, Search } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel.jsx';
import { SearchPanel } from './SearchPanel.jsx';

export const Header = ({ title = 'Dashboard', showSearch = false }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const notificationButtonRef = React.useRef(null);

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsSearchOpen(false); // Close search when opening notifications
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setIsNotificationOpen(false); // Close notifications when opening search
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-6 py-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.name || 'User'}
            </p>
          </motion.div>

          {/* Right */}
          <div className="flex items-center gap-4">
            {showSearch && (
              <motion.button
                onClick={toggleSearch}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`hidden sm:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 hover:bg-muted/80 transition-colors ${
                  isSearchOpen ? 'ring-2 ring-primary' : ''
                }`}
              >
                <Search className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Search...</span>
                <kbd className="hidden lg:inline-flex px-2 py-0.5 text-xs font-semibold bg-background rounded border">
                  ⌘K
                </kbd>
              </motion.button>
            )}

            {/* Mobile Search Button */}
            {showSearch && (
              <motion.button
                onClick={toggleSearch}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`sm:hidden p-2 hover:bg-muted rounded-lg transition-colors ${
                  isSearchOpen ? 'bg-muted' : ''
                }`}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </motion.button>
            )}

            {/* Notification Button */}
            <motion.button
              ref={notificationButtonRef}
              onClick={toggleNotifications}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 hover:bg-muted rounded-lg transition-colors relative ${
                isNotificationOpen ? 'bg-muted' : ''
              }`}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                >
                  <motion.span
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="absolute inset-0 bg-red-500 rounded-full"
                  />
                </motion.span>
              )}
            </motion.button>

            {/* Profile Picture */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name || 'User'}
                  className="w-9 h-9 rounded-full object-cover border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-sm font-semibold border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                  {getUserInitials()}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        buttonRef={notificationButtonRef}
      />

      {/* Search Panel */}
      <SearchPanel
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialQuery={searchQuery}
      />
    </>
  );
}

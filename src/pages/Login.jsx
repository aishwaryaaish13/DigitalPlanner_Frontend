import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import { Input } from '../components/common/Input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card.jsx';
import { Loader2, Mail, Lock, User, ArrowRight, Home, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!form.password.trim()) {
      toast.error('Please enter your password');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (!isLogin) {
      if (!/[A-Z]/.test(form.password)) {
        toast.error('Password must contain at least one uppercase letter');
        return;
      }
      if (!/[a-z]/.test(form.password)) {
        toast.error('Password must contain at least one lowercase letter');
        return;
      }
      if (!/[0-9]/.test(form.password)) {
        toast.error('Password must contain at least one number');
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
        toast.error('Password must contain at least one special character');
        return;
      }
    }

    if (!isLogin) {
      if (!form.name.trim()) {
        toast.error('Please enter your name');
        return;
      }
      if (form.name.trim().length < 2) {
        toast.error('Name must be at least 2 characters long');
        return;
      }
    }

    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(form.email, form.password);
      } else {
        result = await register(form.email, form.password, form.name);
      }

      if (result.success) {
        toast.success(
          isLogin ? 'Logged in successfully!' : 'Account created successfully!'
        );
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Authentication failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Something went wrong';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Back to Home Button */}
      <motion.button
        onClick={() => navigate('/')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Home</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">MindTrack</h1>
          <p className="text-muted-foreground">Your Digital Planner</p>
        </motion.div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Register only) */}
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Field */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <Input
                  type="password"
                  placeholder={isLogin ? "Enter your password" : "Min 8 chars, 1 uppercase, 1 number, 1 special"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  disabled={isLoading}
                />
                {!isLogin && form.password && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 space-y-1"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${form.password.length >= 8 ? 'bg-green-500' : 'bg-muted'}`} />
                      <span className={form.password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(form.password) ? 'bg-green-500' : 'bg-muted'}`} />
                      <span className={/[A-Z]/.test(form.password) ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(form.password) ? 'bg-green-500' : 'bg-muted'}`} />
                      <span className={/[0-9]/.test(form.password) ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                        One number
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(form.password) ? 'bg-green-500' : 'bg-muted'}`} />
                      <span className={/[!@#$%^&*(),.?":{}|<>]/.test(form.password) ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                        One special character
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              {/* Toggle */}
              <div className="text-center text-sm text-muted-foreground pt-2">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-semibold text-primary hover:underline"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

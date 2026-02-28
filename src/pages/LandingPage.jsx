import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  CheckCircle2, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Sparkles,
  BarChart3,
  Zap,
  Shield,
  Users,
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Smart Calendar',
      description: 'Organize your schedule with an intuitive calendar view',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: 'Task Management',
      description: 'Track and complete your daily tasks efficiently',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Goal Tracking',
      description: 'Set and achieve your personal and professional goals',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Digital Journal',
      description: 'Capture your thoughts and reflections daily',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Habit Builder',
      description: 'Build positive habits and track your progress',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI Assistant',
      description: 'Get personalized insights and recommendations',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const stats = [
    { icon: <Users className="w-6 h-6" />, value: '10K+', label: 'Active Users' },
    { icon: <CheckCircle2 className="w-6 h-6" />, value: '1M+', label: 'Tasks Completed' },
    { icon: <Zap className="w-6 h-6" />, value: '99.9%', label: 'Uptime' },
    { icon: <Shield className="w-6 h-6" />, value: '100%', label: 'Secure' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold">MindTrack</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <Button
                onClick={() => navigate('/login')}
                variant="ghost"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate('/login?mode=signup')}
              >
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/50 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <BarChart3 className="w-10 h-10 text-primary-foreground" />
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Your Digital Life,
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Organized
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The all-in-one productivity platform for tasks, goals, habits, and personal growth
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => navigate('/login?mode=signup')}
                size="lg"
                className="text-lg px-8 py-6 group"
              >
                Start Free Today
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6"
              >
                Sign In
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features to help you stay organized and achieve your goals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="h-full bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-lg transition-all">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for you
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
            className="bg-card border border-border rounded-xl p-8"
          >
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Basic task management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Calendar view</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Daily journal</span>
              </li>
            </ul>
            <Button
              onClick={() => navigate('/login?mode=signup')}
              variant="outline"
              className="w-full"
            >
              Get Started
            </Button>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-card border-2 border-primary rounded-xl p-8 relative shadow-lg"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$9</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Everything in Free</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Goal tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Habit builder</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Analytics & insights</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>AI assistant</span>
              </li>
            </ul>
            <Button
              onClick={() => navigate('/payment')}
              className="w-full"
            >
              Upgrade to Pro
            </Button>
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-8"
          >
            <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Team collaboration</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Custom integrations</span>
              </li>
            </ul>
            <Button
              onClick={() => navigate('/payment')}
              variant="outline"
              className="w-full"
            >
              Contact Sales
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border rounded-2xl p-12 md:p-16 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already organizing their lives with MindTrack
          </p>
          <Button
            onClick={() => navigate('/login?mode=signup')}
            size="lg"
            className="text-lg px-8 py-6 group"
          >
            Create Your Free Account
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold">MindTrack</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MindTrack. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

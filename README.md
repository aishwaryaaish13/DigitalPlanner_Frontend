# MindTrack – Digital Planner & Journal

A modern, production-ready React frontend for a comprehensive digital planning and journaling application. Built with Vite, React, Tailwind CSS, and Framer Motion.

## 🚀 Features

### Core Features
- **Authentication**: Secure login/registration with JWT tokens
- **Dashboard**: Interactive dashboard with summary cards and charts
- **Calendar**: Monthly calendar with event management
- **Task Management**: Drag-and-drop task list with priorities
- **Journal**: Rich journaling with mood tracking
- **Goals**: Track progress toward personal goals
- **Mood Tracker**: Daily mood logging with analytics
- **Habit Tracker**: Build and maintain positive habits

### Advanced Capabilities
- **AI Integration**: 
  - AI Journal Assistant for writing improvement
  - Task breakdown suggestions
  - Mood analysis and insights
  - Goal motivation generation
- **Animations**: Smooth page transitions with Framer Motion
- **Drag & Drop**: Reorder tasks using dnd-kit
- **Charts**: Data visualization with Recharts
- **Theme System**: Dark/light mode with custom color themes
- **Responsive Design**: Mobile-first, fully responsive UI
- **Real-time Notifications**: Toast notifications with react-hot-toast

## 📁 Project Structure

```
src/
├── components/
│   ├── calendar/        # Calendar component
│   ├── tasks/          # Task management components
│   ├── journal/        # Journal entry components
│   ├── goals/          # Goals components
│   ├── mood/           # Mood tracker components
│   ├── habit/          # Habit tracker components
│   ├── dashboard/      # Dashboard components
│   └── common/         # Reusable UI components
├── context/            # Context API (Auth, App state)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API service layer
├── utils/              # Utility functions and helpers
├── App.jsx            # Main app component with routing
└── main.jsx           # Entry point
```

## 🛠 Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Custom ShadCN-style components
- **Animations**: Framer Motion
- **Drag & Drop**: dnd-kit
- **API**: Axios
- **State Management**: Context API
- **Routing**: React Router v6
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd frontend-code
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Start development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

## 🎯 Usage

### Authentication
- Navigate to `/login` to sign up or log in
- Demo credentials: `test@example.com` / `password`
- JWT token is stored in localStorage

### Dashboard
- View summary cards and weekly analytics
- See mood trends and task completion stats

### Tasks
- Add, edit, delete tasks
- Drag to reorder tasks
- Filter by priority (High, Medium, Low)
- Mark tasks as complete

### Calendar
- Navigate between months
- Click dates to add events
- View events in sidebar

### Journal
- Write journal entries with mood emoji
- Use AI Assistant to improve writing
- View past entries

### Goals
- Create goals with target and deadline
- Track progress with visual progress bars
- Watch completion animations

### Mood Tracker
- Log daily mood with emoji selector
- Add optional notes
- View mood history

### Habits
- Create habits with descriptions
- Mark daily completion
- Track streak counter
- View completion statistics

### Theme
- Toggle dark/light mode using header button
- Preferences saved to localStorage

## 🔌 API Integration

All API calls go through Axios with automatic:
- Authorization header injection (JWT token)
- Error handling with redirects to login on 401
- Base URL from environment variables

### Service Modules
- `authService`: Login, register, logout
- `taskService`: CRUD operations for tasks
- `journalService`: Journal entries and images
- `goalService`: Goal management
- `moodService`: Mood logging and analysis
- `habitService`: Habit tracking
- `aiService`: AI analysis endpoints

## 🤖 AI Integration

The app supports AI features via API endpoints:

```javascript
// Example: Improve journal entry
import { aiService } from './services/aiService.js';

const response = await aiService.improveJournal(text);
```

Supported AI types:
- `journal_improvement`: Enhance writing
- `task_breakdown`: Generate subtasks
- `mood_analysis`: Analyze mood patterns
- `goal_motivation`: Generate motivation

## 🎨 Customization

### Colors & Theme
Edit CSS variables in `src/index.css`:
```css
:root {
  --primary: 142.4 71.8% 29.2%;
  --secondary: 217.2 91.2% 59.8%;
  /* ... more colors */
}
```

### Components
Reusable components in `src/components/common/`:
- `Button`: Variants (primary, secondary, outline, ghost, destructive)
- `Card`: Flexible card layouts
- `Input/Textarea`: Form inputs
- `Modal`: Dialog component
- `Skeleton`: Loading placeholders

### Animations
Default animations are configured in Tailwind config:
- `fade-in`, `fade-out`
- `slide-in`
- `accordion-down`, `accordion-up`

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Sidebar collapses on mobile
- Touch-friendly interactive elements

## 🚀 Performance

- Code splitting with React.lazy and Suspense
- Optimized imports and tree-shaking
- CSS minification with Tailwind
- Production build optimization with Vite

## 🔐 Security

- JWT token storage in localStorage
- Automatic token injection in API requests
- 401 error handling redirects to login
- Protected routes with ProtectedRoute component

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Follow the project structure
2. Keep components small and focused
3. Use custom hooks for logic
4. Write meaningful commit messages
5. Test responsiveness on mobile

## 📄 License

This project is proprietary and confidential.

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [dnd-kit](https://docs.dndkit.com/)

## 🔗 Related Projects

Backend API: https://github.com/aishwaryaaish13/DigitalPlanner_Backend.git

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Happy Planning! 📝✨**

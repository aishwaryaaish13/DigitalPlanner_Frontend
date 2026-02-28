# Animation Guide

This document outlines all the animations implemented in the MindTrack app to create an interactive and engaging user experience.

## Animation Library

The app uses **Framer Motion** for all animations, providing smooth, performant animations throughout.

## Implemented Animations

### 1. Page Transitions
- **Location**: All pages (Dashboard, Tasks, Journal, Goals, Mood, Habits, Calendar)
- **Effect**: Fade in with upward slide on entry, fade out with downward slide on exit
- **Duration**: 300ms
- **Purpose**: Smooth navigation between pages

### 2. Sidebar Animations
- **Logo**: Rotates 360° on hover
- **Menu Items**: 
  - Staggered entrance animation (each item appears with 50ms delay)
  - Slide right and scale up on hover
  - Icon wiggle animation on hover
  - Background highlight follows cursor
- **Logout Button**: Scale and slide on hover
- **Initial Load**: Slides in from left with spring animation

### 3. Card Components
- **Hover Effect**: Lifts up (-4px) with enhanced shadow
- **Transition**: Smooth 200ms spring animation
- **Used In**: All cards throughout the app

### 4. Summary Cards (Dashboard)
- **Staggered Entry**: Cards appear one by one with 100ms delay
- **Value Animation**: Numbers scale up with spring effect
- **Icon Hover**: Rotates 360° and scales up
- **Gradient Background**: Expands and increases opacity on hover
- **Card Hover**: Lifts up 8px with shadow enhancement

### 5. Button Interactions
- **Hover**: Scales to 105%
- **Click**: Scales down to 95%
- **Disabled State**: No animation, reduced opacity
- **Duration**: 200ms

### 6. Input & Textarea
- **Focus**: Scales to 102% with blue glow shadow
- **Transition**: Smooth 200ms
- **Purpose**: Visual feedback for user interaction

### 7. Modal Animations
- **Backdrop**: Fades in/out
- **Modal Container**: 
  - Scales from 90% to 100%
  - Slides up 20px
  - Spring animation for natural feel
- **Close Button**: Rotates 90° on hover
- **Content**: Staggered fade-in for header, body, and footer

### 8. Task List
- **Drag Handle**: Scales up on hover, down on drag
- **Checkbox**: 
  - Scales up on hover
  - Spring animation when checked
- **Task Item**: 
  - Slides in from left on add
  - Slides out to left on delete
  - Opacity changes during drag
- **Actions**: Fade in on hover

### 9. Goals List
- **Progress Bar**: Animates width from 0 to target percentage
- **Gradient Fill**: Smooth color transition
- **Card Hover**: Lifts with shadow
- **Drag & Drop**: Smooth reordering with position transitions
- **Delete Button**: Scale and background color change on hover

### 10. Header
- **Initial Load**: Fades in and slides down
- **Title**: Slides in from left
- **Search Bar**: Slides in from right
- **Bell Icon**: Scales on hover and tap

### 11. Theme Toggle
- **Icon Switch**: 
  - Rotates 90° in/out
  - Scales from 0 to 1
  - Smooth 300ms transition
- **Button**: Rotates 180° on click

### 12. Empty State
- **Container**: Scales up with spring animation
- **Icon**: 
  - Rotates from -180° to 0°
  - Scales from 0 to 1
  - Rotates 360° on hover
- **Text**: Staggered fade-in

### 13. AI Assistant
- **Button**: Gradient background with hover opacity
- **Response Card**: Fades in and slides up
- **Loading State**: Spinner rotation

### 14. Loading Components
- **Spinner**: Continuous 360° rotation
- **Pulse Loader**: Three dots with staggered scale and opacity
- **Shimmer**: Gradient slides left to right continuously

## Animation Utilities

Created `src/utils/animations.js` with reusable animation variants:
- `pageVariants` - Standard page transitions
- `fadeInUp` - Fade with upward movement
- `scaleIn` - Scale with fade
- `slideInLeft/Right` - Directional slides
- `staggerContainer/Item` - Staggered children
- `floatingAnimation` - Continuous floating effect
- `pulseAnimation` - Continuous pulse
- `hoverScale/Lift` - Hover effects
- `tapScale` - Tap feedback

## Performance Considerations

1. **Hardware Acceleration**: All animations use transform and opacity for GPU acceleration
2. **Reduced Motion**: Respects user's motion preferences (can be enhanced)
3. **Lazy Loading**: Page components are lazy-loaded to improve initial load time
4. **AnimatePresence**: Used for exit animations and conditional rendering

## Best Practices Used

- Consistent timing (200-300ms for most interactions)
- Spring animations for natural feel
- Staggered animations for lists
- Hover feedback on interactive elements
- Scale + opacity for smooth transitions
- Minimal animation on disabled states

## Future Enhancements

- Add gesture controls (swipe, pinch)
- Implement scroll-triggered animations
- Add confetti or celebration animations for goal completion
- Create custom loading states per feature
- Add sound effects (optional)

# Overview

CRUX is a full-stack web application for workout tracking that gamifies fitness through an XP-based reward system. It enables users to log comprehensive workout sessions with per-set variation, track recovery activities, and monitor progress over time. The application features a complete battle pass rewards system with 10 tiers, offering badges and themes as rewards. Users earn XP through workouts (base 10 XP + 1 XP per set + 2 XP per minute of duration), automatically unlock rewards as they level up, and can personalize their experience with different theme colors and unit preferences (metric/imperial).

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with React, TypeScript, and Vite, utilizing TailwindCSS and shadcn/ui for a modern, responsive design. It follows a modular component structure, with pages, reusable components, and UI elements organized into distinct folders. Client-side routing is handled by React Router DOM, featuring responsive navigation with a top bar for desktop and a bottom tab bar for mobile. Server state is managed using TanStack Query, providing caching and optimistic updates, while form state uses React Hook Form with Zod validation. Styling employs a utility-first approach with TailwindCSS, a light theme (primary green, light background, dark text), and custom CSS properties for consistent theming. Path aliases simplify imports.

## Backend Architecture

The backend is an Express.js API built with TypeScript, using ESM modules. It provides RESTful endpoints for managing exercises, workout sessions, and battle pass progress. Custom middleware logs API requests and tracks duration. Data access is abstracted through an `IStorage` interface, currently implemented by an in-memory storage (`MemStorage`), allowing for future database integration. Zod schemas ensure type safety and validate incoming data. Critical security measures include server-side XP calculation to prevent client manipulation and robust validation against exercise templates.

## Database Schema

The application uses PostgreSQL with Drizzle ORM for type-safe database access. The schema includes `users`, `exercise_templates`, `workout_sessions`, `workout_entries`, `rewards`, and `user_rewards`. 

**Duration Standardization (Phase 7.6.1):** All duration fields use minutes (`durationMin`) for consistency across workouts, programs, and recovery sessions. XP calculation: 2 XP per minute (maintaining same effective rate as previous 30-second based system).

**Unit Conversion System (Phase 7.6.2):** Users have `unitPreference` field ('metric' | 'imperial', default 'metric') for weight/distance display preferences. Weight stored in kg, distance in meters. Conversion utilities in `client/src/utils/unitConversion.ts` handle display formatting. Settings tab in Profile page provides toggle between unit systems.

**Workout & Recovery:** `workout_sessions` store metadata for both workout and recovery activities. Recovery sessions now count toward streak and total workouts. `workout_entries` (linked to sessions) contain individual exercise logs with a `setsData` JSONB column for per-set variation. `ExerciseSet` objects capture reps, weightKg, durationMin, and distanceMeters. 

**XP & Rewards:** XP is calculated server-side: base 10 XP + 1 XP per set + 2 XP per minute of duration + distance-based XP. The `rewards` table stores badge and theme rewards, while `user_rewards` tracks unlocked/claimed status. Users have `currentLevel`, `activeTheme`, `avatarBadgeId`, and `unitPreference` fields. Drizzle Kit manages schema migrations.

## Battle Pass Rewards System

The application features a complete 10-tier battle pass rewards system with automatic unlocking and theme personalization. Users earn XP through workouts (base 10 XP + 1 XP per set), which automatically calculates their level (20 XP per level). When users level up, rewards for that tier are automatically unlocked. The system includes:

**Rewards Configuration** (shared/rewards-config.ts):
- 10 seeded rewards: 5 badges (Trophy, Star, Crown, Medal, Fire) at tiers 1, 3, 5, 7, 9, plus Legend at tier 10
- 4 theme rewards at tiers 2, 4, 6, 8 (Ocean, Sunset, Forest, Midnight)
- Each theme includes primary, secondary, and accent color configurations

**Auto-Unlock Mechanism**:
- When a workout is created via POST /api/workouts/sessions, the backend calculates XP
- Battle pass progress is updated with new XP total and level
- System checks if new level unlocks any rewards
- Eligible rewards are automatically added to user's unlocked rewards

**Global Theme Switching** (React Context):
- Theme system uses React Context (client/src/context/ThemeContext.tsx) for global state
- Theme palettes defined in client/src/styles/themeConfig.ts
- Users claim unlocked themes from Rewards page
- Claimed themes appear in Profile page with "Use" button
- Theme changes apply instantly without page reload via setTheme() from useTheme() hook
- ThemeProvider fetches user's activeTheme on mount and applies via CSS custom properties
- All UI components reference theme colors through Tailwind classes (bg-primary, text-primary, etc.)
- Theme selection persists to database via POST /api/rewards/theme/:id

**API Layer**:
- GET /api/rewards - List all rewards with unlock status
- POST /api/rewards/claim/:id - Claim an unlocked reward
- POST /api/rewards/theme/:id - Set active theme
- GET /api/users/:id - Get user data including activeTheme and currentLevel
- Battle pass progress automatically updates when workouts are created

**UI Pages**:
- Rewards page: Standalone page with tier progression, locked/unlocked rewards, claim buttons, and "Equip as Avatar" functionality for claimed badges
- Profile page: Tabbed interface with user stats, claimed badges grid, theme switcher, settings, and debug tools

## Profile System (Phase 6 & 6.5)

The Profile page features a comprehensive tabbed interface with 3 distinct sections, providing complete user account management and personalization. The Rewards functionality has been moved to a standalone page at /rewards.

**Profile Tab:**
- Avatar display (96x96 circular) showing equipped badge icon or default user icon
- Stats cards grid (responsive 2-column mobile, 4-column desktop):
  - Total XP: Aggregate from all seasons via GET /api/users/:userId/stats
  - Current Level: Calculated from totalXP (20 XP per level)
  - Current Streak: Active streak days from PassProgress
  - Workouts Completed: Total count from workout_sessions table
- Theme selector: Button group showing Default Green + unlocked theme rewards
- Claimed badges grid (4-column mobile, 6-column desktop): Clickable badges that equip as avatar when clicked

**Standalone Rewards Page (/rewards):**
- Complete battle pass tier progression visualization
- Next reward preview with XP requirements
- All rewards grid with unlock/claim states
- "Equip as Avatar" button on claimed badges
- Checkmark indicator on currently equipped badge
- Theme claiming and activation controls

**Settings Tab:**
- Placeholder UI for future features:
  - Notifications toggle (disabled, "Coming Soon")
  - Privacy settings toggle (disabled, "Coming Soon")
  - Account reset button (disabled, "Coming Soon")

**Debug Tab:**
- Conditional visibility (only shown when user.debug === 1)
- XP Multiplier: Button group toggle (1x, 2x, 5x, 10x) - session-only, resets to 1x on page reload
- XP controls: Input field + "Add XP" button (applies multiplier, default 100 XP)
- Reset controls: "Reset Streak" and "Reset Season" buttons
- All actions log to console with 🔧 emoji prefix
- Success/error toasts for user feedback
- Designed for production debugging without code deployment

**Enhanced Season Reset (Phase 6.5):**
When "Reset Season" is clicked, the following comprehensive cleanup occurs:
- All UserReward entries are deleted (all rewards become locked again)
- PassProgress reset: XP=0, level=0, streakDays=0
- User's avatarBadgeId cleared (avatar returns to default user icon)
- User's activeTheme reset to 'default' (if not already)
- User's currentLevel reset to 0
- Comprehensive console logging of all cleanup actions

**Database Schema Extensions:**
- `users.debug` (integer, default 0): Flag enabling debug tab visibility
- `users.avatarBadgeId` (text, nullable): References rewards.id for equipped avatar badge

**API Endpoints:**
- GET /api/users/:userId/stats: Returns aggregated stats (totalXP, streakDays, workoutsCompleted, programsCompleted)
- POST /api/users/:userId/avatar: Equips badge as avatar (body: { badgeId })
- POST /api/debug/add-xp: Adds XP to user with optional multiplier (body: { userId, amount, seasonId, multiplier? })
  - Multiplier must be one of [1, 2, 5, 10]
  - Calculates finalAmount = amount × multiplier
- POST /api/debug/reset-streak: Resets current streak to 0 (body: { userId, seasonId })
- POST /api/debug/reset-season: Comprehensively resets season - locks all rewards, clears avatar/theme, resets progress (body: { userId, seasonId })

**Technical Implementation:**
- Tabbed navigation using shadcn Tabs component
- All data fetching via TanStack Query with proper caching
- Mutations invalidate relevant query caches for instant UI updates
- Responsive grid layouts following design guidelines
- Loading states during mutations (isPending checks)
- Comprehensive data-testid attributes for e2e testing
- Theme switching console logs preserved for debugging

## Development Environment

The development environment uses Vite for frontend builds, esbuild for backend bundling, and tsx for direct TypeScript execution in development. It features Hot Module Replacement (HMR) and strict TypeScript configuration for type safety across the codebase.

# External Dependencies

**UI Framework**: Radix UI (primitives), shadcn/ui (components), Lucide React (icons).

**Database**: Neon Serverless PostgreSQL driver (`@neondatabase/serverless`), Drizzle ORM.

**Validation & Forms**: Zod, React Hook Form, @hookform/resolvers.

**Utilities**: date-fns, clsx, tailwind-merge, class-variance-authority.

**Session Management**: connect-pg-simple (configured but not fully implemented).

**Build & Development Tools**: Vite, esbuild, Replit-specific plugins, PostCSS, TailwindCSS, Autoprefixer.
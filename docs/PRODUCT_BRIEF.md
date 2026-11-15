# **CRUX**

## **Product, Engineering, and Technical Handoff Brief**

Version 1.0 | November 15, 2026 | Prepared for Claude Code | Target platform: React Native + Expo

**Purpose:** This document is the source of truth for transferring the Crux product vision, decisions, feature requirements, and current development direction into a new GitHub repository.

It is intentionally detailed. It distinguishes between things that have been discussed and agreed upon, things that have only been proposed, and things that have not been decided.

**Important instruction for the incoming developer:** Do not invent existing functionality, database schemas, XP values, API integrations, or AI behavior. Where an implementation detail has not been established, mark it as undecided and ask before treating it as a product requirement.

# **1. PRODUCT**

## **1.1 Product vision**

Crux is an AI-powered, gamified fitness and wellness platform designed to make building healthy habits feel as engaging as playing a video game.

The product combines personalized AI-driven workout programming, a progression and reward system inspired by games like Fortnite, and social features that let users train alongside friends, compete, complete shared challenges, and hold each other accountable. It extends beyond physical training into mental wellness, meditation, recovery, and nutrition, creating a holistic platform focused on improving both body and mind. The central idea is that people generally have access to enough fitness information to improve themselves. The problem is translating that information into a personalized plan that works for their body, lifestyle, preferences, and goals, and then finding the motivation to consistently follow through. Crux uses AI to solve the personalization problem and game mechanics to solve the consistency problem.

**Core brand philosophy:**

You don't just work out. You Crux it.

The product should feel like a combination of:

- Fortnite's progression and reward mechanics.
- Duolingo's habit-building and daily engagement.
- Personalized digital personal training.
- Social gaming and competition.
- A holistic wellness platform.

The product should not feel like a generic workout tracker with an AI chatbot attached.

It should feel like an actual fitness game that happens to improve your health.

## **1.2 The problem Crux solves**

There are four primary problems.

**Problem 1: Generic fitness programming**

Most fitness applications offer similar exercises, programs, and templates. They provide useful information, but they don't necessarily translate that information into something that works for an individual.

Crux addresses this through personalized programming that considers:

- Fitness goals.
- Experience level.
- Available equipment.
- Available workout time.
- Schedule.
- Physical limitations and injuries.
- Exercise preferences.
- Training history.
- Progress and performance.

**Problem 2: Lack of consistency**

Knowing what to do and actually doing it are two different things.

People frequently start fitness programs and abandon them because they lack motivation, accountability, or a compelling reason to return.

Crux addresses this with:

- XP.
- Levels.
- Battle Pass progression.
- Achievements.
- Daily and weekly objectives.
- Unlockable rewards.
- Streaks.
- Social competition.

**Problem 3: Working out alone**

People are more likely to enjoy activities when they can share them with others.

Crux introduces:

- Friends.
- Squads.
- Shared programs.
- Group challenges.
- Leaderboards.
- Social achievements.
- Shared progression.

Importantly, the social experience must remain optional. Someone who works out alone should receive the same core product experience as someone who has an established group of friends.

**Problem 4: Fitness is bigger than exercise**

Physical fitness is connected to nutrition, sleep, recovery, mental wellness, and daily habits.

Crux aims to bring those pieces together rather than requiring users to maintain five different applications.

## **1.3 Target customer**

Primary demographic:

- Gen Z.
- Millennials.
- Approximately 18 to 35 years old.
- Digitally native.
- Familiar with gaming progression systems.
- Comfortable with subscription products.
- Interested in fitness but potentially inconsistent with maintaining routines.

Psychographic characteristics:

- Motivated by visible progress.
- Enjoy competition and achievement.
- Respond to immediate feedback.
- Comfortable with AI-driven experiences.
- Value personalization.
- Enjoy social interaction.
- Want fitness to become part of their lifestyle rather than a chore.

Secondary audience:

- Older generations interested in accessible fitness programming.
- People returning to fitness.
- Beginners who need guidance.
- People who prefer solo workouts.

The initial product should primarily appeal to the first audience without excluding the others.

# **2. CORE LOOP**

The core product loop is the most important part of Crux.

The goal is to create a system where users naturally return because they want to continue progressing.

## **2.1 Typical user session**

The proposed user journey:

| Step | User action           | Crux response                                                        |
| ---- | --------------------- | -------------------------------------------------------------------- |
| 1    | Opens the app         | Sees current level, XP, Battle Pass progress, and today's objectives |
| 2    | Checks daily goals    | Sees workout, wellness, and other assigned objectives                |
| 3    | Opens today's workout | Sees personalized workout overview                                   |
| 4    | Starts workout        | Enters guided exercise experience                                    |
| 5    | Completes exercises   | Tracks sets, reps, weights, and completion                           |
| 6    | Takes rest periods    | Uses built-in rest timer                                             |
| 7    | Completes workout     | Receives workout completion summary                                  |
| 8    | Earns XP              | Progresses through level and Battle Pass systems                     |
| 9    | Shares progress       | Can post achievements or compare progress with friends               |
| 10   | Returns later         | Sees updated goals, progression, and next workout                    |

## **2.2 What makes users come back?**

The retention loop should operate on multiple timescales.

**Daily:**

- Complete daily workout.
- Complete daily objectives.
- Earn XP.
- Maintain streaks.
- Check social progress.

**Weekly:**

- Complete weekly objectives.
- Compare progress with friends.
- Reach milestones.
- Unlock rewards.
- Review training progress.

**Program-based:**

- Progress through a six-week training program.
- Advance through the associated Battle Pass.
- Complete the program.
- Unlock the final reward.
- Start another program.

**Social:**

- See a friend complete a workout.
- Compete on XP.
- Complete a shared challenge.
- Encourage squad members.
- Participate in limited-time events.

The important product principle is that users should have meaningful progression even when they are not actively lifting weights.

For example, meditation, recovery, mobility, and other wellness activities could contribute to daily progression.

Exact XP values for these activities are not yet decided.

# **3. XP AND GAMIFICATION**

This is the primary product differentiator.

The gamification system should be designed as a foundational product feature, not something added later.

## **3.1 Core mechanics**

The following systems have been discussed:

| Mechanic             | Purpose                                   | Status  |
| -------------------- | ----------------------------------------- | ------- |
| XP                   | Reward user activity                      | Planned |
| Levels               | Show long-term progression                | Planned |
| Battle Pass          | Seasonal/program-based rewards            | Planned |
| Daily quests         | Encourage daily engagement                | Planned |
| Weekly quests        | Encourage consistency                     | Planned |
| Program milestones   | Reward structured progression             | Planned |
| Achievements         | Recognize accomplishments                 | Planned |
| Streaks              | Encourage repeated participation          | Planned |
| Leaderboards         | Encourage friendly competition            | Planned |
| Squad challenges     | Encourage group participation             | Planned |
| Avatar customization | Give users cosmetic rewards               | Planned |
| Real-world rewards   | Connect achievements to physical products | Future  |

## **3.2 XP earning**

We have discussed rewarding users for:

- Completing workouts.
- Completing individual fitness objectives.
- Completing daily goals.
- Completing weekly goals.
- Reaching program milestones.
- Maintaining consistency.
- Participating in social challenges.
- Completing mental wellness activities.
- Completing nutrition and lifestyle objectives.

However, **we have not established actual XP point values.**

The following values are NOT decided:

| Activity                     | XP value    |
| ---------------------------- | ----------- |
| Complete workout             | Not decided |
| Complete exercise            | Not decided |
| Complete daily quest         | Not decided |
| Complete weekly quest        | Not decided |
| Complete meditation          | Not decided |
| Complete nutrition objective | Not decided |
| Complete squad challenge     | Not decided |
| Reach program milestone      | Not decided |
| Maintain streak              | Not decided |

Do not hardcode arbitrary XP amounts into the application.

Build the XP system so that values can be configured centrally.

## **3.3 Battle Pass**

The Battle Pass is inspired by Fortnite.

The original concept:

- Each six-week fitness program can have its own Battle Pass.
- Users progress through the pass by earning XP.
- Rewards are unlocked as users advance.
- Rewards can be cosmetic or physical.
- Users should be able to see their progression throughout the program.

Example rewards discussed:

- AI trainer hats.
- AI trainer shirts.
- Avatar accessories.
- Background colors.
- Special cosmetic items.
- Crux-branded gear.
- Partner-branded apparel.
- Discounts and real-world perks.

The trainer/avatar customization is intended to give users a visible representation of their progress.

**Important:** The 3D avatar system is not part of the initial MVP. The Battle Pass should be architected independently of 3D rendering.

## **3.4 Subscription versus program Battle Pass**

Two purchase structures were discussed:

1. Monthly subscription that includes premium features and progression.
2. Individual six-week program purchases with an associated Battle Pass.

The exact relationship between these systems is not decided.

For example, it is not yet established whether free users can earn XP but cannot purchase premium rewards, or whether Battle Pass access is exclusively paid.

## **3.5 Streaks, levels, and achievements**

These systems have been discussed conceptually.

However:

- Level thresholds: Not decided.
- Level names: Not decided.
- XP requirements per level: Not decided.
- Streak reset rules: Not decided.
- Streak freezes: Not decided.
- Achievement list: Not decided.
- Badge artwork: Not decided.
- Quest generation rules: Not decided.
- Leaderboard ranking formula: Not decided.

Recommended engineering approach:

Build these as configurable systems rather than embedding the rules directly into individual screens.

# **4. AI TRAINER LOGIC**

## **4.1 AI trainer purpose**

The AI trainer is responsible for creating and adapting personalized fitness programming.

It is not simply a chatbot that answers fitness questions.

It should operate as an intelligent programming engine that understands the user's profile, goals, available resources, and training history.

## **4.2 User inputs**

The proposed AI trainer should consider:

| Input                | Purpose                             |
| -------------------- | ----------------------------------- |
| Fitness goal         | Determines programming direction    |
| Experience level     | Determines exercise complexity      |
| Available equipment  | Determines exercise selection       |
| Workout availability | Determines schedule                 |
| Workout duration     | Determines session length           |
| Physical limitations | Helps avoid inappropriate exercises |
| Exercise preferences | Improves adherence                  |
| Training history     | Supports progression                |
| Previous performance | Helps adjust programming            |
| Recovery feedback    | Helps adapt intensity               |
| Energy and mood      | Provides additional context         |

Specific onboarding questions and their exact wording have not been finalized.

## **4.3 Workout generation**

The intended workflow:

1. Collect user profile.
2. Identify primary training goal.
3. Determine appropriate training frequency.
4. Generate a structured program.
5. Assign individual workouts.
6. Populate workouts with exercises.
7. Assign sets, reps, rest periods, and other relevant parameters.
8. Track completion.
9. Use training history when generating subsequent workouts.

The AI should generate structured data that the application can display and track.

It should not generate unstructured text that the frontend must attempt to interpret.

## **4.4 Workout adaptation**

We discussed adaptive programming based on:

- Previous workout performance.
- Training progression.
- Recovery.
- Schedule changes.
- Mood and energy check-ins.
- Physical limitations.

However, exact progression rules have not been decided.

For example, we have not established:

- How much weight increases after successful workouts.
- When reps should increase.
- How deload weeks are determined.
- How missed workouts affect program progression.
- Whether the AI automatically changes exercises.
- Whether users must approve significant program changes.

These need to be designed with qualified fitness professionals.

## **4.5 AI system prompts**

No finalized system prompt was written in the conversation.

The following is the intended behavior, not an existing prompt:

```
CRUX AI TRAINER

You are the personalized fitness programming engine
for Crux.

Your purpose is to generate structured, personalized
fitness programs based on each user's goals, experience,
schedule, equipment, preferences, limitations, and
training history.

You must:

1. Generate workouts appropriate to the user's
   experience and stated goals.

2. Account for available equipment.

3. Account for workout duration and schedule.

4. Consider previous training performance when
   recommending future workouts.

5. Support sustainable progression.

6. Incorporate appropriate warm-ups, mobility,
   and recovery.

7. Adapt recommendations when users report changes
   in energy, recovery, availability, or limitations.

8. Provide clear exercise instructions and
   structured workout data.

9. Avoid presenting medical diagnoses or treatment
   recommendations.

10. Never encourage users to train through pain
    or ignore physical limitations.

11. Never fabricate workout history or performance data.

12. Prioritize user safety and sustainable
    long-term progress.

Return structured data in the format expected
by the Crux application.
```

This is a proposed starting prompt. It has not been tested or approved as production logic.

## **4.6 Future AI capabilities**

Discussed future possibilities:

- Video-based movement analysis.
- Form correction.
- Computer vision.
- Automated exercise demonstrations.
- Recovery-based programming.
- AI nutrition recommendations.
- Personalized mental wellness suggestions.

These are future capabilities, not MVP requirements.

# **5. FEATURES**

This section separates actual development status from the product roadmap.

One important distinction: We know you have a functional application in Replit, but the conversation does not contain a feature-by-feature code audit. Therefore, it would be inaccurate to claim that every conceptual feature is already implemented.

## **5.1 Built and working**

| Feature                       | Status                                        |
| ----------------------------- | --------------------------------------------- |
| Replit application            | User reports a functional app                 |
| Initial application structure | Exists, implementation details not documented |
| Initial MVP development       | Underway                                      |

No specific working database, authentication system, AI integration, or completed gamification implementation was confirmed in the conversation.

## **5.2 Built but buggy / incomplete**

| Feature                           | Status                                         |
| --------------------------------- | ---------------------------------------------- |
| Workout pages and navigation flow | Current development blocker                    |
| Workout experience                | Requires further implementation and refinement |

The specific issue is that the workout pages are not flowing together as intended.

You explicitly identified this as the area where you were getting stuck.

## **5.3 Planned MVP features**

**Gamification**

- XP tracking.
- Basic levels.
- Daily objectives.
- Weekly objectives.
- Battle Pass progression.
- Completion rewards.

**AI training**

- Personalized workout programming.
- User profile-based exercise selection.
- Sets and reps.
- Training schedule.
- Workout history.
- Progress tracking.

**Workout experience**

- Workout overview.
- Exercise-by-exercise navigation.
- Exercise instructions.
- Set completion.
- Rest timer.
- Skip exercise.
- Workout completion.
- XP reward summary.

**Social**

- Friends.
- Basic squads.
- Shared training programs.
- Progress comparison.
- Leaderboards.

The exact MVP social scope is not decided. A lightweight social foundation is preferable to attempting to build a complete social network immediately.

**Mental wellness**

- Daily mindset check-ins.
- Mood and energy tracking.
- Guided breathing.
- Short meditation sessions.
- Optional journaling prompts.

**Nutrition**

- Goal-based meal recommendations.
- Dietary preferences.
- Basic meal planning.
- Grocery list generation.

The mental wellness and nutrition systems were discussed as part of the broader product vision. Their inclusion in the first public MVP is not finalized.

## **5.4 Future features**

| Feature                     | Reason for later implementation                 |
| --------------------------- | ----------------------------------------------- |
| Full 3D avatars             | More expensive and technically complex          |
| Customizable 3D trainers    | Requires avatar and rendering infrastructure    |
| 3D exercise demonstrations  | Requires modeling and animation pipeline        |
| AI form correction          | Requires computer vision and validation         |
| Influencer-led classes      | Requires creator ecosystem                      |
| Live fitness classes        | Requires streaming and scheduling               |
| AR/VR workouts              | Longer-term expansion                           |
| Brand marketplace           | Requires established user base and partnerships |
| Gym membership integrations | Requires business partnerships                  |
| Physical rewards            | Requires fulfillment and partnerships           |
| Advanced nutrition tracking | Adds considerable complexity                    |
| Full social feed            | Not required to validate the initial product    |

## **5.5 Cut or rejected**

| Feature / approach                           | Decision             | Reason                                  |
| -------------------------------------------- | -------------------- | --------------------------------------- |
| Full 3D modeling in initial MVP              | Cut from initial MVP | Cost and development time               |
| AI video form correction in initial MVP      | Deferred             | Significant technical complexity        |
| Expensive AR/VR experience at launch         | Deferred             | Not necessary to validate core product  |
| Overly complex social identity in brand name | Rejected             | Should not exclude solo users           |
| Making the product exclusively group-based   | Rejected             | Solo training must be equally supported |

**Important nuance:** 3D modeling was not rejected as a product concept. You specifically want it in the longer-term vision. It was removed from the initial MVP to reduce cost and accelerate development.

# **6. DATA MODEL**

No finalized database schema was written during our previous discussions.

The following is a proposed logical data model based on the product requirements. It is a recommended starting architecture, not an existing Replit schema.

The new repository should implement these entities in a way that supports future expansion.

## **6.1 Core entities**

| Entity              | Purpose                                 |
| ------------------- | --------------------------------------- |
| users               | Authentication and user identity        |
| user_profiles       | Fitness and lifestyle information       |
| fitness_goals       | User objectives                         |
| training_programs   | Structured training plans               |
| program_days        | Individual scheduled workouts           |
| workouts            | Individual workout instances            |
| exercises           | Exercise library                        |
| workout_exercises   | Exercises assigned to workouts          |
| exercise_sets       | Set-level prescriptions and performance |
| workout_sessions    | Actual workout attempts                 |
| workout_history     | Historical training records             |
| xp_transactions     | XP earned and spent                     |
| user_levels         | Current progression state               |
| battle_passes       | Program-associated progression          |
| battle_pass_rewards | Unlockable rewards                      |
| user_rewards        | Rewards earned                          |
| quests              | Daily, weekly, and milestone objectives |
| quest_progress      | Individual quest completion             |
| achievements        | Achievement definitions                 |
| user_achievements   | Earned achievements                     |
| streaks             | Activity streak tracking                |
| friendships         | Friend relationships                    |
| squads              | Group identities                        |
| squad_members       | Membership relationships                |
| challenges          | Social and individual challenges        |
| challenge_progress  | Challenge completion                    |
| wellness_checkins   | Mood and energy check-ins               |
| meditation_sessions | Wellness activity records               |
| meal_plans          | User meal plans                         |
| meals               | Individual meals                        |
| nutrition_logs      | User food logging                       |

## **6.2 Proposed relationship structure**

```
USER
 |
 +---- USER_PROFILE
 |
 +---- FITNESS_GOALS
 |
 +---- TRAINING_PROGRAMS
 |       |
 |       +---- PROGRAM_DAYS
 |               |
 |               +---- WORKOUTS
 |                       |
 |                       +---- WORKOUT_EXERCISES
 |                               |
 |                               +---- EXERCISES
 |                               |
 |                               +---- EXERCISE_SETS
 |
 +---- WORKOUT_SESSIONS
 |
 +---- WORKOUT_HISTORY
 |
 +---- XP_TRANSACTIONS
 |
 +---- USER_LEVELS
 |
 +---- BATTLE_PASS_PROGRESS
 |
 +---- USER_REWARDS
 |
 +---- QUEST_PROGRESS
 |
 +---- USER_ACHIEVEMENTS
 |
 +---- STREAKS
 |
 +---- FRIENDSHIPS
 |
 +---- SQUAD_MEMBERS
 |
 +---- WELLNESS_CHECKINS
 |
 +---- MEAL_PLANS
```

## **6.3 Important implementation considerations**

**Workout history must be persistent.**

The AI trainer needs access to historical performance, not just the current workout.

**XP must be transaction-based.**

Do not simply store an XP number and increment it from arbitrary frontend interactions.

Each XP award should have a transaction record.

This allows:

- Auditing.
- Preventing duplicate rewards.
- Tracking where XP came from.
- Recalculating balances.
- Supporting future reward systems.

**Workout completion must be authoritative.**

The application should not award XP simply because someone opens a workout screen.

Completion needs to be recorded and validated.

**Social relationships need privacy controls.**

A user should be able to choose whether their workouts, achievements, and progress are visible to friends.

**AI-generated programming should be stored.**

Once a workout is generated and accepted, preserve its original structure. Do not regenerate it every time a user opens the screen.

# **7. SCREENS AND UX**

## **7.1 Overall navigation**

The exact navigation architecture has not been finalized.

The recommended MVP structure is:

```
APP
 |
 +---- HOME
 |
 +---- TRAINING
 |       |
 |       +---- PROGRAM OVERVIEW
 |       |
 |       +---- WORKOUT OVERVIEW
 |       |
 |       +---- ACTIVE WORKOUT
 |       |
 |       +---- EXERCISE DETAILS
 |       |
 |       +---- REST TIMER
 |       |
 |       +---- WORKOUT COMPLETE
 |
 +---- PROGRESSION
 |       |
 |       +---- XP
 |       +---- LEVELS
 |       +---- BATTLE PASS
 |       +---- REWARDS
 |       +---- ACHIEVEMENTS
 |
 +---- SOCIAL
 |       |
 |       +---- FRIENDS
 |       +---- SQUADS
 |       +---- LEADERBOARDS
 |       +---- CHALLENGES
 |
 +---- WELLNESS
 |       |
 |       +---- MOOD CHECK-IN
 |       +---- MEDITATION
 |       +---- BREATHWORK
 |       +---- JOURNAL
 |
 +---- NUTRITION
 |       |
 |       +---- MEAL PLAN
 |       +---- MEAL RECOMMENDATIONS
 |       +---- FOOD LOG
 |
 +---- PROFILE
         |
         +---- FITNESS PROFILE
         +---- SETTINGS
         +---- AVATAR
```

This is a proposed information architecture, not a confirmed existing navigation structure.

## **7.2 Workout screens**

These are the most important screens to complete first.

### **A. Workout overview**

Displays:

- Workout name.
- Program name.
- Day number.
- Exercise count.
- Estimated workout duration.
- Muscle groups targeted.
- Workout summary.
- Start workout button.

Example:

```
TODAY'S WORKOUT

DAY 01: UPPER BODY STRENGTH

6 Exercises
45 Minutes
Upper Body

[START WORKOUT]
```

### **B. Active exercise screen**

Displays:

- Exercise name.
- Exercise demonstration.
- Exercise instructions.
- Sets.
- Reps.
- Weight.
- Current set.
- Exercise progress.
- Complete set button.
- Skip button.
- Next button.

The demonstration should initially use a static image, GIF, or video.

3D demonstrations are future functionality.

### **C. Rest screen**

Displays:

- Countdown timer.
- Next exercise.
- Motivational message.
- Skip rest option.
- Adjust timer option.

### **D. Workout complete screen**

Displays:

- Completed exercises.
- Completed sets.
- Workout duration.
- XP earned.
- Progression update.
- Mood/energy check-in.
- Share with squad option.

Example:

```
WORKOUT COMPLETE

YOU CRUXED IT.

+ XP EARNED

PROGRAM PROGRESS UPDATED

[VIEW PROGRESS]
[SHARE WITH SQUAD]
```

The actual XP value is not decided.

## **7.3 Visual direction**

The brand direction has been discussed extensively.

**Brand name:** CRUX

**Visual identity:**

- Powerful grayscale foundation.
- Dark backgrounds.
- Modern typography.
- High-contrast neon accents.
- Minimal but bold visual language.
- Gaming-inspired progression UI.

You specifically liked the idea of flexible accent colors.

For example:

- The main application could use a consistent grayscale foundation.
- Different programs or seasons could introduce different neon accent colors.
- Special events could change accent colors.
- Limited-time events could introduce temporary visual themes.

The idea is that the app feels like a living ecosystem.

Exact hex values have not been decided.

## **7.4 Brand language**

Established brand language:

- Crux.
- Crux it.
- Let's Go Cruxit.
- Your Crux Crew.
- Crux Score.

The strongest concept is turning the name into a verb.

Example:

```
YOU CRUXED IT.
```

The tone should be:

- Confident.
- Competitive.
- Energetic.
- Modern.
- Slightly playful.
- Not overly corporate.
- Not excessively motivational or cheesy.

# **8. TECH IN REPLIT**

## **8.1 Current development environment**

The application is currently being developed using an AI builder on Replit.

You reported having a functional application but encountering difficulties with the workout-page flow.

The existing technical stack was not documented in our conversation.

The following have NOT been confirmed:

| Component             | Existing implementation |
| --------------------- | ----------------------- |
| Frontend framework    | Not confirmed           |
| Backend framework     | Not confirmed           |
| Database              | Not confirmed           |
| Authentication        | Not confirmed           |
| ORM                   | Not confirmed           |
| AI provider           | Not confirmed           |
| AI model              | Not confirmed           |
| API integrations      | Not confirmed           |
| Image hosting         | Not confirmed           |
| Analytics             | Not confirmed           |
| Payment provider      | Not confirmed           |
| Environment variables | Not documented          |

Do not assume that the existing Replit implementation uses Firebase, Supabase, or any particular backend.

## **8.2 New development environment**

The new repository will use:

- React Native.
- Expo.
- GitHub.
- Claude Code as the development assistant.

The specific versions and supporting libraries are not decided.

## **8.3 Recommended architecture**

A modular architecture is important because Crux will eventually contain multiple interconnected systems.

Suggested organization:

```
crux/
|
+---- app/
|     |
|     +---- (auth)/
|     +---- (tabs)/
|     +---- workout/
|     +---- program/
|     +---- progression/
|     +---- social/
|     +---- wellness/
|     +---- nutrition/
|
+---- components/
|     |
|     +---- ui/
|     +---- workout/
|     +---- gamification/
|     +---- social/
|
+---- features/
|     |
|     +---- authentication/
|     +---- training/
|     +---- ai-trainer/
|     +---- gamification/
|     +---- social/
|     +---- wellness/
|     +---- nutrition/
|
+---- services/
|     |
|     +---- api/
|     +---- ai/
|     +---- storage/
|
+---- hooks/
|
+---- types/
|
+---- constants/
|
+---- utils/
|
+---- assets/
|
+---- docs/
```

This is a suggested structure, not an existing repository structure.

## **8.4 Important technical requirements**

1. AI generation must be handled server-side, not by exposing API keys in the mobile application.
2. Workout data should use structured types.
3. XP transactions should be validated server-side.
4. User progress must persist between sessions.
5. Workout sessions should support interruptions and resuming.
6. Social features must respect privacy settings.
7. AI-generated programs should be stored and versioned.
8. Future avatar systems should not require rewriting the workout engine.
9. Gamification should be configurable.
10. The application should support both solo and social users.

No environment variable names were established in the previous discussions.

# **9. DECISIONS AND WHY**

This section captures the major decisions that should not be unnecessarily revisited.

| Decision                              | Reason                                                          |
| ------------------------------------- | --------------------------------------------------------------- |
| Product name is Crux                  | Short, powerful, flexible, memorable                            |
| Gamification is central               | Solves the motivation and retention problem                     |
| AI personalization is central         | Solves generic workout programming                              |
| Social features are important         | Builds accountability and competition                           |
| Solo users must be supported          | The product cannot depend on having friends                     |
| Battle Pass mechanics                 | Creates structured progression and rewards                      |
| 3D is not in initial MVP              | Reduces cost and time to market                                 |
| 3D remains part of long-term vision   | Creates differentiated exercise visualization and customization |
| Fitness is not the only pillar        | Mental wellness and nutrition contribute to holistic health     |
| Mobile-first product                  | The intended experience is accessible and convenient            |
| Gen Z and Millennials are primary     | Familiarity with gaming, social apps, and subscriptions         |
| Subscription plus program purchases   | Multiple potential monetization paths                           |
| Partnerships are a future opportunity | Apparel, supplements, gyms, and wellness businesses             |
| Dynamic brand colors                  | Supports seasons, events, and program identities                |

## **9.1 Pricing discussions**

The following pricing ideas were discussed:

| Offering                       | Discussed price   |
| ------------------------------ | ----------------- |
| Monthly subscription           | $75/month         |
| Alternative subscription range | $50 to $75/month  |
| Six-week program               | $100              |
| Free tier                      | Yes, conceptually |

A previous financial model used $59/month.

That was a modeling assumption, not a finalized price.

The exact pricing structure is not decided.

## **9.2 Funding discussions**

We discussed two possible fundraising approaches after removing 3D modeling from the MVP.

| Build approach           | Estimated raise |
| ------------------------ | --------------- |
| Lean MVP                 | $250K to $350K  |
| More fully resourced MVP | $600K to $650K  |

These are preliminary planning estimates, not validated development quotes.

The initial team concept included:

- Technical co-founder.
- Full-stack engineering.
- AI/ML development.
- Product design.
- Fitness programming expertise.
- Marketing/growth.
- Operations.

The technical co-founder was identified as the most important early relationship.

The ideal candidate should:

- Understand AI/ML.
- Understand software architecture.
- Have full-stack development capabilities.
- Be capable of leading engineering.
- Have a genuine interest in fitness and wellness.

# **10. KEEP VS REBUILD**

This is particularly important for the transition to Claude Code.

## **10.1 What should carry over**

Preserve the existing product thinking and any working implementation that can be verified.

Carry over:

- Crux branding.
- Product positioning.
- Workout programming concepts.
- Gamification philosophy.
- AI trainer requirements.
- Social product direction.
- Wellness and nutrition vision.
- Workout data and logic, if implemented correctly.
- Existing reusable assets.
- Existing exercise library.
- Existing content.
- Existing working business logic.

Do not automatically discard working code simply because the application is moving to React Native.

However, do not blindly copy web-specific UI code into a React Native application.

## **10.2 What should be rebuilt**

**Workout navigation and interaction**

The workout flow is the current blocker. This is the first area to properly architect in the new application.

**Mobile interface**

Build native-feeling screens with appropriate touch targets, navigation, keyboard handling, and responsive layouts.

**Component architecture**

Create reusable components for:

- Exercise cards.
- Workout cards.
- Set trackers.
- Timers.
- XP indicators.
- Progress bars.
- Reward displays.

**Application state**

Ensure that workout progress, exercise completion, rest timers, and XP updates behave consistently.

**AI integration**

Separate the AI programming engine from the user interface.

**Gamification infrastructure**

Implement a centralized XP and progression system instead of scattering reward logic throughout the application.

## **10.3 Migration principle**

Do not attempt to rebuild every planned Crux feature at once.

The goal is to create a strong technical foundation around the smallest valuable product experience.

# **11. OPEN QUESTIONS**

These are the items that remain unresolved and should be addressed during development.

## **11.1 Product**

- What exactly does the first-time onboarding experience look like?
- How many workout programs ship with the MVP?
- Does AI generate an entire program or individual workouts?
- How much can users edit their AI-generated programs?
- Can users switch programs mid-cycle?
- How are missed workouts handled?

## **11.2 Gamification**

- What is the XP awarded for each action?
- How many XP are required for each level?
- How many Battle Pass tiers exist?
- Does the Battle Pass reset every six weeks?
- Is there a free and paid Battle Pass?
- Can XP be earned on rest days?
- How are streaks calculated?
- What happens when someone misses a day?
- Are there XP limits to prevent exploitation?

## **11.3 AI**

- Which AI provider will be used?
- Which model will generate workouts?
- Will AI-generated workouts be reviewed by a fitness professional?
- What progression algorithm will be used?
- How will training limitations be handled?
- How will the system prevent unsafe exercise recommendations?
- Will the AI trainer have a persistent conversational identity?
- How much historical data should be included in each programming request?

## **11.4 Social**

- How are friends added?
- Can users invite friends into existing programs?
- Can friends start at different points in a program?
- Are squads permanent or program-specific?
- How are leaderboards calculated?
- Can users hide their activity?
- Will social features be included in the first public release?

## **11.5 Mental wellness**

- Which meditation and breathwork content ships initially?
- Will content be internally produced or licensed?
- How will mood check-ins influence programming?
- How do we distinguish general wellness support from clinical mental health advice?

## **11.6 Nutrition**

- Will Crux generate complete meal plans?
- Will it provide calorie and macronutrient estimates?
- Will users log individual meals?
- Will grocery lists be generated?
- Will nutrition be part of the paid subscription?
- How will dietary restrictions and allergies be handled?

## **11.7 Business**

- Final subscription price.
- Final program price.
- Free-tier limitations.
- Battle Pass monetization.
- Partner reward economics.
- Payment processing.
- Initial fundraising target.
- Technical co-founder equity.
- Brand and trademark clearance.

# **12. SMALLEST FIRST SLICE**

Highest development priority

## **Build one complete workout experience, from opening the workout to earning XP.**

This is the single most valuable end-to-end flow to build first.

Do not start with the social feed, nutrition, meditation library, 3D avatars, or complicated AI personalization.

Build a workout that actually works.

## **12.1 The experience**

SCREEN 01

**HOME / TODAY'S TRAINING**



- Today's workout.
- Current program.
- XP and level.
- Daily objective.
- Start workout.

SCREEN 02

**WORKOUT OVERVIEW**



- Workout name.
- Exercise list.
- Sets and reps.
- Estimated duration.
- Start button.

SCREEN 03

**ACTIVE WORKOUT**



- Exercise demonstration.
- Current set.
- Weight and reps.
- Complete set.
- Next exercise.

SCREEN 04

**REST TIMER**



- Countdown.
- Next exercise.
- Skip rest.

SCREEN 05

**WORKOUT COMPLETE**



- Workout summary.
- Completed sets.
- XP earned.
- Updated progress.
- Share option.

## **12.2 Functional requirements**

The entire experience must work.

1. User opens today's workout.
2. User sees the workout overview.
3. User starts the workout.
4. User completes individual sets.
5. User can record weights and reps.
6. User can move between exercises.
7. User can skip exercises.
8. User can use a rest timer.
9. User can pause and resume.
10. User finishes the workout.
11. The application saves workout history.
12. The application awards XP.
13. The application updates progression.
14. The application displays a completion summary.

## **12.3 Definition of done**

The first slice is complete when:

- A user can complete an entire workout without encountering navigation errors.
- Every completed set is recorded.
- Workout progress survives application interruptions.
- Workout history is saved.
- XP is awarded exactly once for a completed workout.
- The user sees their updated progression.
- The experience works on an actual mobile device.

This validates the core Crux experience before expanding into additional systems.

# **FINAL HANDOFF: PRODUCT DIRECTION FOR CLAUDE CODE**

The following should be treated as the guiding product instructions when continuing development.

```
PROJECT: CRUX

PLATFORM:
React Native + Expo

REPOSITORY:
New GitHub repository

DEVELOPMENT ASSISTANT:
Claude Code

PRODUCT:
AI-powered gamified fitness and wellness application.

CORE DIFFERENTIATOR:
Combine personalized AI training, video-game-style
progression, and social accountability to make fitness
more engaging and sustainable.

PRIMARY PRODUCT PILLARS:

1. GAMIFICATION
   XP, levels, Battle Passes, quests, achievements,
   rewards, streaks, and leaderboards.

2. AI PERSONAL TRAINING
   Personalized workout programming based on goals,
   experience, equipment, schedule, preferences,
   limitations, and training history.

3. SOCIAL FITNESS
   Friends, squads, shared programs, challenges,
   and competition.

4. MENTAL WELLNESS
   Meditation, breathwork, mood tracking,
   and mental fitness.

5. NUTRITION
   Meal recommendations, meal planning,
   and nutrition tracking.

BRANDING:
CRUX

BRAND LANGUAGE:
"Let's Go Cruxit."
"You Cruxed It."

VISUAL DIRECTION:
Dark grayscale foundation.
Bold typography.
Neon accent colors.
Gaming-inspired progression.
Modern, clean, mobile-first UI.

MVP PRIORITY:
Complete the workout experience from
workout overview through exercise completion,
rest periods, workout history, and XP awards.

DO NOT PRIORITIZE:
3D avatars.
AR/VR.
AI video form correction.
Influencer-led classes.
Complex marketplace functionality.

ARCHITECTURE PRINCIPLES:

- Modular feature architecture.
- Persistent user data.
- Structured AI-generated workout data.
- Server-side AI requests.
- Configurable gamification.
- Transaction-based XP.
- Reusable UI components.
- Clear separation between business logic
  and presentation.
- Scalable social and wellness architecture.

IMPORTANT:
Do not invent previously undecided XP values,
pricing, database schemas, AI progression rules,
or integrations.

Build the smallest complete experience first.
Validate it.
Then expand.
```


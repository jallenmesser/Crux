# Crux

AI-powered, gamified fitness and wellness app. "You don't just work out. You Crux it."
Platform: React Native + Expo, built with Claude Code. Owner: Jallen (he/they), working mostly from a phone, so keep updates short and decisions as clear choices.

Full product context lives in `docs/PRODUCT_BRIEF.md`. Read it before planning. It separates what is decided from what is only proposed. Treat anything marked "not decided" as an open question, not a requirement.

## How we work
- Use the `crux-build` skill at the start of every build session.
- No code until the spec and plan are approved by Jallen.
- Build the smallest complete slice first, then validate, then expand.
- Never push to main without approval. Work on a branch.

## Do not invent
Do not make up XP values, level thresholds, pricing, database schemas, AI progression rules, or integrations. If one is needed, ask. Propose options and let Jallen pick.

## Architecture rules (from the brief)
- XP is transaction-based, with one record per award. Never just increment a number from the UI.
- XP values, levels, quests, and streak rules are configurable in one central place, not hardcoded in screens.
- Workout completion is authoritative and awards XP exactly once.
- AI generation runs server-side. No API keys in the mobile app.
- AI returns structured workout data, which is stored and not regenerated on every open.
- Workout sessions survive interruptions and can resume.
- Solo users get the full core experience. Social is optional.
- Keep business logic separate from presentation. Do not tie the workout engine to 3D avatars.

## First slice (highest priority)
One complete workout, end to end: today's workout, overview, active exercise with set logging, rest timer, skip and pause/resume, workout complete with XP and updated progress. The workout page flow is where the Replit prototype got stuck. See section 12 of the brief for screens and the definition of done.

## Not now
3D avatars, AR/VR, AI video form correction, influencer classes, marketplace, full social feed. Nutrition, mental wellness, and social are planned but not in the first slice.

## Existing Replit prototype
A working prototype exists on Replit, but its stack was never documented. Before reusing anything, inspect its source (if available) and confirm what is reusable. Do not copy web UI code directly into React Native.

## Brand voice
Confident, competitive, energetic, modern, slightly playful. Not corporate or cheesy. Dark grayscale base, bold type, neon accents that can change by program or season. Exact colors are not decided.

## Open items to resolve early
Backend and database choice, AI provider and model, auth, XP and level numbers, and brand and trademark clearance for the name Crux.

---
name: crux-build
description: How we build Crux, an AI personal training app with XP and gamification. Use at the start of any Crux build session, feature, or planning request.
---

# Crux build workflow

Crux is an AI personal training app with XP and gamification. Stack: React Native (with a web build possible).

## Rules
1. No code until the spec and plan are approved by Jallen. Write the spec first, then wait.
2. Build the smallest shippable slice first. One user flow working end to end beats many half-built screens.
3. Tests first for logic (XP rules, workout logging, progression). Use the tdd-workflow skill.
4. Before calling anything done, run the verification-loop skill and report results plainly.
5. Run security-review before any feature touching auth, user data, or payments.
6. Work happens from a phone. Keep updates short, decisions as clear choices, and never ask Jallen to copy or paste between tools.
7. Commit on a branch, small commits, clear messages. Never push to main without approval.

## Session flow
1. Read the README and the current spec in the repo.
2. State the slice being built and its done condition.
3. Plan with plan-orchestrate, get approval.
4. Build, test, verify.
5. Summarize what shipped and the next slice.

## First slice (to confirm with Jallen)
Log a workout and earn XP, working end to end.

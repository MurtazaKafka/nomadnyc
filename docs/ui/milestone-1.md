# UI Milestone 1 — Nomad Voice Companion

## Goal
Deliver a cross-platform (mobile-first) interface that lets a pilot user listen to prioritized email summaries, approve suggested actions, and issue follow-up voice commands while commuting.

## Key Screens / Flows
1. **Inbox Overview (Driving Mode)**
   - Carousel of prioritized emails (urgent → later) with glanceable metadata.
   - Big tap/voice CTAs: “Play Summary”, “Approve Action”, “Defer”.
   - Live status pill showing connection to agent service (latency indicator).
2. **Email Detail Modal**
   - Transcript of voice summary + contextual insights (phenoml metadata, Airia snippets).
   - Suggested actions as cards with confirm/modify options.
   - Voice input button (OpenAI Realtime) + fallback text input for testing.
3. **Task Queue / Pending Actions**
   - List of drafts the agent is awaiting approval on (reply drafts, schedule suggestions).
   - Quick approve/send buttons, ability to edit text.
4. **Settings & Accounts**
   - OAuth status (Gmail), API keys (dev mode), voice settings (ElevenLabs voice selection).
   - Telemetry opt-in for Datadog metrics.

## MVP Scope (Hackathon Weekend)
- Focus on screens 1 & 2 with mocked API responses (wire to live agent service in Phase 2).
- Build with Expo + React Native (supports iOS/Android, fast iteration).
- Use Zustand for local state, TanStack Query for agent API calls.
- Integrate voice capture via Expo AV + WebRTC stub (actual voice later).
- Styling: Tailwind NativeWind for speed, ensure dark-friendly palette.

## Stretch Goals
- CarPlay/Android Auto prototype layout.
- Offline cache of last 10 summaries.
- Voice diarization (# of tasks completed indicator).

## Success Criteria
- Usability test: 1 founder clears 3 emails in under 3 minutes using test data.
- Demo story: split-screen showing agent console logs + mobile UI interactions.
- Judges can see sponsor tool usage (phenoml metadata badge, Datadog toggle).

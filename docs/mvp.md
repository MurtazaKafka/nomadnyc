# Nomad MVP Scope

## Goal
Deliver a hands-free daily commute companion that keeps a busy executive up to date on their inbox by the time they reach the office.

## Constraints & Assumptions
- Single user (founder dogfooding) with Gmail account.
- Voice capture via mobile web UI; command vocabulary limited to a small set ("summarize", "respond", "schedule").
- No real-time email send yet—approval happens via generated text + voice confirmation.
- Latency budget: < 2 seconds for voice -> summary confirmation loop using streaming ASR and TTS.

## MVP Capabilities
1. **Inbox ingestion**
   - Gmail webhooks (watch API) push new email metadata into our queue.
   - Metadata stored in Supabase/PostgreSQL; full body fetched on demand (with scoped OAuth).
2. **Priority classification**
   - phenoml-backed classifier determines urgency bucket (urgent, today, later).
   - Scores persisted for analytics and retraining.
3. **Summarization + action suggestions**
   - Claude 3 Sonnet or GPT-4o produces a three-bullet summary and suggested next action for each new email.
   - Highlights missing context and fetches relevant knowledge via Airia when available.
4. **Voice interface (narrow scope)**
   - React Native app streams microphone audio to OpenAI Realtime.
   - Spoken responses synthesized via ElevenLabs, returned alongside text summary.
   - User can say "archive", "draft reply", or "remind me"; agent records intent and queues follow-up task.
5. **Task execution stubs**
   - Draft replies saved as pending actions; final sending deferred to later milestone.
   - Scheduling requests create calendar draft (not auto-sent) pending manual review.

## Out of Scope (for now)
- Multi-user tenancy, enterprise compliance, shared inboxes.
- Full autonomous sending of emails or calendar invites.
- Mobile auto-launch integrations (CarPlay, Android Auto).
- Real-time speech diarization for overlapping speakers.

## Success Metric
By end of hackathon, a commuting user should clear the top 5 emails in under 3 minutes without touching the keyboard, with Datadog metrics showing <2s avg latency and ≥60% autonomy (actions handled without manual correction).

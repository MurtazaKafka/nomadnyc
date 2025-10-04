# Nomad Voice Email Agent

docs/                   # Architecture, MVP scope, research notes
  integrations/         # API-specific integration plans (e.g., phenoml)
Hands-free inbox triage for busy operators, starting with a focused MVP suitable for the NYC AI Agent Hackathon.

- 📄 MVP definition: see [`docs/mvp.md`](./docs/mvp.md)
- 🛠️ Current focus: backend agent service for email ingestion, prioritization, and summarization with voice-triggered intents.
- � phenoml-backed priority scoring with heuristic fallback and metadata tracing.
- �🗺️ Roadmap: build iteratively—first summaries, then intent execution, finally autonomous send.

## Repository Layout

```
apps/
  agent-service/        # TypeScript backend prototype for email processing
docs/                   # Architecture, MVP scope, research notes
```

## Getting Started

Install Node.js 20+ and pnpm (recommended) or npm.

```bash
pnpm install
pnpm --filter agent-service dev
```

If you prefer npm workspaces:

```bash
npm install
npm run dev --workspace agent-service
```

Environment variables live in `.env` at the repository root. See [`apps/agent-service/.env.example`](./apps/agent-service/.env.example) for required values (`OPENAI_API_KEY`, `PHENOML_API_KEY`, model name, and timeout budget).

## Running the Sample Pipeline

The agent-service ships with three mock emails in `data/sample-emails.json`.

```bash
pnpm --filter agent-service sample
```

You should see prioritized summaries in the console for each message. With a valid `OPENAI_API_KEY`, summaries come from GPT-4o mini; otherwise the fallback heuristic summary is used. Use `pnpm --filter agent-service dev` when you want hot-reload during development.

To run the unit tests:

```bash
pnpm --filter agent-service test
```

## Next Build Targets

1. Add Gmail webhook ingestion (Pub/Sub) and persistence layer (Supabase).
2. Integrate Datadog MCP metrics spanning latency, autonomy %, and tool usage.
3. Wire DeepL + Airia APIs for translation and contextual knowledge snippets.
4. Attach voice interface (React Native + OpenAI Realtime) that streams commands into this backend.

Each milestone will ship with short demo scenarios to stay within the “start small, expand fast” philosophy.

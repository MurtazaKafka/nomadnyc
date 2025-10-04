# Agent Service

TypeScript backend prototype that ingests email content, classifies urgency, surfaces contextual insights, and suggests actions for the Nomad voice agent.

## Commands

```bash
pnpm install
pnpm --filter agent-service dev    # start HTTP API with live reload (default port 8081)
pnpm --filter agent-service sample # run sample pipeline once in the console
pnpm --filter agent-service build  # emit dist output
pnpm --filter agent-service test   # execute Vitest suite
```

> Summaries automatically fall back to the heuristic formatter if the OpenAI Realtime API throttles or errors.

## Environment Variables

| Variable | Description |
| --- | --- |
| `OPENAI_API_KEY` | Optional — enables GPT-4o mini summaries. Fallback heuristic used otherwise. |
| `PHENOML_API_KEY` | Enables remote urgency classification via phenoml (falls back to heuristics when unset). |
| `PHENOML_MODEL` | Model identifier to request from phenoml (default `nomad-email-priority`). |
| `PHENOML_TIMEOUT_MS` | Timeout budget for phenoml HTTP calls (default `1500`). |
| `AIRIA_API_KEY` | Reserved for Airia context enrichment (stubbed in MVP). |
| `PORT` / `AGENT_PORT` | Optional — override the HTTP port (defaults to `8081`). |
| `CORS_ORIGINS` | Optional comma-separated allowlist for browser origins hitting the API. |

## HTTP API

When running in `dev`/`start` mode the service exposes JSON endpoints:

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Basic readiness information. |
| `GET` | `/api/emails` | Returns the cached email agent outputs (seeded from `data/sample-emails.json`). |
| `POST` | `/api/emails` | Accepts a raw email payload and returns the processed agent output. |
| `POST` | `/api/emails/refresh` | Re-runs the sample dataset through the pipeline. |
| `DELETE` | `/api/emails/:id` | Drops an item from the in-memory cache. |

`POST /api/emails` expects JSON containing `subject`, `bodyText`, and `from`. Optional fields include `id`, `receivedAt`, `bodyHtml`, `labels`, and `threadId`. Missing IDs are generated via `crypto.randomUUID()`.

## Data Flow

1. Load email payload (currently from `data/sample-emails.json`).
2. Run heuristic priority classifier.
3. Enrich with contextual hints (stubbed rules representing Airia).
4. Generate summary + action suggestions (OpenAI when available, heuristic fallback otherwise).
5. Emit aggregated result for downstream voice layer or HTTP consumers.

## Next Steps

- Log phenoml latency and accuracy metrics to Datadog MCP + ClickHouse.
- Swap context stubs for real Airia SDK calls.
- Persist outputs to Supabase for downstream mobile client consumption.
- Connect voice interface commands once mobile client is ready.

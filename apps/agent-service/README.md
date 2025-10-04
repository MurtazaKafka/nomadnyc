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
| `IMAP_HOST` / `IMAP_PORT` / `IMAP_SECURE` | IMAP server host, port, and TLS preference for fetching live mail. |
| `IMAP_USER` / `IMAP_PASSWORD` | Credentials (or app password) for the mailbox Nomad should monitor. |
| `IMAP_MAILBOX` | Mailbox folder to open (defaults to `INBOX`). |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | Outbound SMTP host configuration for sending replies. |
| `SMTP_USER` / `SMTP_PASSWORD` | SMTP credentials used to authenticate when dispatching replies. |
| `EMAIL_FROM_ADDRESS` | Optional override for the `From` header when Nomad sends a reply (defaults to `SMTP_USER`). |
| `EMAIL_SYNC_BATCH_SIZE` | Maximum number of emails pulled from the provider per sync (default `10`). |
| `PORT` / `AGENT_PORT` | Optional — override the HTTP port (defaults to `8081`). |
| `CORS_ORIGINS` | Optional comma-separated allowlist for browser origins hitting the API. |

## HTTP API

When running in `dev`/`start` mode the service exposes JSON endpoints:

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Basic readiness information. |
| `GET` | `/api/emails` | Hydrates the cache from IMAP when configured (falls back to sample data) and returns the latest agent outputs. |
| `POST` | `/api/emails` | Accepts a raw email payload and returns the processed agent output. |
| `POST` | `/api/emails/refresh` | Forces a mailbox sync or, if IMAP is disabled, re-runs the sample dataset through the pipeline. |
| `DELETE` | `/api/emails/:id` | Drops an item from the in-memory cache. |
| `POST` | `/api/emails/:id/reply` | Generates a tailored response and, when SMTP is configured, sends it as a real reply. |
| `POST` | `/api/emails/:id/quick-responses` | Returns lightweight reply snippets for the selected email. |
| `POST` | `/api/emails/ingest` | Bulk-ingests external email payloads and caches their agent outputs. |
| `POST` | `/api/voice/transcribe` | Accepts Whisper-compatible audio, returns the interpreted command plus synthesized speech for the agent’s reply. |
| `POST` | `/api/voice/speak` | Synthesizes speech for arbitrary text (helper for UI prototyping). |

`POST /api/emails` expects JSON containing `subject`, `bodyText`, and `from`. Optional fields include `id`, `receivedAt`, `bodyHtml`, `labels`, and `threadId`. Missing IDs are generated via `crypto.randomUUID()`.

## Data Flow

1. Load email payload (IMAP mailbox when configured, otherwise `data/sample-emails.json`).
2. Run heuristic priority classifier.
3. Enrich with contextual hints (stubbed rules representing Airia).
4. Generate summary + action suggestions (OpenAI when available, heuristic fallback otherwise).
5. Emit aggregated result for downstream voice layer or HTTP consumers.

## Next Steps

- Log phenoml latency and accuracy metrics to Datadog MCP + ClickHouse.
- Swap context stubs for real Airia SDK calls.
- Persist outputs to Supabase for downstream mobile client consumption.
- Connect voice interface commands once mobile client is ready.

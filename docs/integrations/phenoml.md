# phenoml Integration Plan

## Objective
Replace the heuristic-only priority classifier with a remote phenoml model to boost accuracy, unlock hackathon prize eligibility, and gather data for retraining.

## Scope for this milestone
- Call phenoml's REST API for each email to obtain urgency scores (0-1) and class labels.
- Fall back to existing heuristics when:
  - No `PHENOML_API_KEY` configured.
  - API call errors or times out (>1.5s budget).
- Log model metadata (version, latency) alongside the result for observability.
- Keep inference stateless (no persistence yet) but expose structured output so we can store it later.

## Assumptions
- phenoml offers an endpoint `POST https://api.phenoml.com/v1/classify` that accepts JSON payloads.
- Request schema:
  ```jsonc
  {
    "model": "nomad-email-priority",
    "inputs": [{
      "id": "email_123",
      "subject": "...",
      "body": "...",
      "from": "..."
    }]
  }
  ```
- Response schema:
  ```jsonc
  {
    "predictions": [{
      "id": "email_123",
      "label": "urgent",
      "score": 0.83,
      "latency_ms": 420,
      "model_version": "2025-09-18-01"
    }]
  }
  ```
- Single prediction per request for now; batching left for later.
- API secured with `Authorization: Bearer <PHENOML_API_KEY>` header.

## Data flow
1. `EmailAgent` hands the raw email payload to the `PriorityClassifier`.
2. Classifier delegates to `PhenomlClient` when available → obtains score/label.
3. Classifier merges phenoml output with heuristics (e.g., boost for VIP senders) and returns `PrioritizedEmail` plus metadata.
4. Agent persists `modelInfo` in the `EmailAgentOutput` (for Datadog metrics later).

## Implementation steps
1. **Client wrapper**
   - Create `services/phenomlClient.ts` with reusable `class PhenomlClient`.
   - Accept config (API key, model name, timeout) at instantiation; use `axios`.
   - Normalize errors into typed `PhenomlError`.
2. **Classifier updates**
   - Extend `PriorityClassifier` constructor to accept optional client.
   - If phenoml response present, map to `EmailUrgency` using label; fallback scores if missing.
   - Preserve heuristics as additive boost (for ties) and fallback path.
   - Include `modelSource` metadata for debugging.
3. **Configuration**
   - Update `config.ts` to read `PHENOML_MODEL` (default `nomad-email-priority`) and timeout env.
   - Export factory `createPriorityClassifier()` for easier dependency injection in tests.
4. **Testing**
   - Add Vitest suite mocking `PhenomlClient` to ensure responses map correctly.
   - Cover fallback path (client throws → heuristics used) and that metadata is forwarded.
5. **Docs & DX**
   - Update `apps/agent-service/.env.example` with new keys.
   - Add setup instructions in both READMEs.
   - Mention latency budget + fallback behavior.

## Future extensions
- Batch classification for throughput.
- Persist phenoml scores to Supabase for daily retraining.
- Feed phenoml predictions into Datadog metrics to chart model performance.

## Current status (Oct 4, 2025)
- ✅ Client wrapper implemented in `src/services/phenomlClient.ts`.
- ✅ `PriorityClassifier` now consumes phenoml predictions with heuristic fallback + metadata.
- ✅ EmailAgent supports dependency injection, enabling tests to disable remote calls.
- ✅ Unit tests cover both success and failure paths.
- ⚠️ Awaiting real phenoml credentials; currently defaults to heuristic when key absent.

# UI Task Breakdown — Hackathon Sprint

## Branch naming convention
- `ui/feature/<short-name>` — e.g., `ui/feature/inbox-carousel`
- `ui/chore/<short-name>` — non-feature work (config, lint, tooling)
- `ui/bugfix/<short-name>` — fixes after QA

## Suggested branches & ownership
| Branch | Scope | Owner (placeholder) |
| --- | --- | --- |
| `ui/feature/app-shell` | Expo app bootstrap, navigation stack (Inbox, Detail, Settings) | Murtaza |
| `ui/feature/inbox-carousel` | Inbox overview UI + prioritization badges | Alp |
| `ui/feature/email-detail` | Detail modal with summary cards and action buttons | Teammate A |
| `ui/feature/task-queue` | Pending actions list w/ approval controls | Teammate B |
| `ui/feature/voice-toggle` | Voice input button, audio recorder stub | Teammate C |
| `ui/chore/design-system` | NativeWind theme, typography, icon set | Shared (pair) |
| `ui/chore/api-client` | TanStack Query + axios wrapper hitting agent service | Shared |

## Definition of done per branch
- Component(s) implemented with responsive styles.
- Storybook stories or Expo Snack preview (optional but recommended).
- Unit tests for logic (e.g., hooks, data transforms) via Jest/React Testing Library.
- Update `apps/mobile/CHANGELOG.md` (to be created) with bullet summary.

## Integration order
1. `ui/feature/app-shell`
2. `ui/chore/api-client`
3. Parallel feature branches (inbox, detail, task queue)
4. `ui/feature/voice-toggle`
5. QA/testing branch (merge via PR checklist)

## PR checklist
- Screenshots / screen recordings attached.
- `pnpm --filter mobile lint` & `test` pass locally.
- Stories updated (if using Storybook).
- Accessibility audit (VoiceOver/ TalkBack quick pass).

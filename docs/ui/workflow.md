# UI Collaboration Workflow

## Tooling
- Version control: Git + GitHub (main branch protected, PR reviews required).
- Task tracking: Linear project `UI Sprint 1` (tickets match branch names).
- Communication: Discord #ui channel + 10-minute standups at 10:30 AM PT.

## Branch Strategy
- `main`: production-ready; only merge via PR with at least one review.
- `develop`: optional staging branch if multiple features need QA simultaneously.
- Feature branches cut from `main` (or `develop` once established).
- Rebase frequently (`git pull --rebase origin main`) to avoid merge conflicts.

## GitHub Workflow
1. Create issue in Linear → sync to GitHub (if integration enabled) or link manually in PR description.
2. Branch off `main`: `git checkout -b ui/feature/app-shell`.
3. Commit with conventional prefixes (`feat(ui): add inbox card component`).
4. Open PR targeting `main` (or `develop` when batching).
5. Add reviewers + QA checklist in PR template.
6. After approval, squash merge. Delete branch after merge.

## Automation
- GitHub Actions (TODO):
  - `pnpm --filter mobile lint`
  - `pnpm --filter mobile test`
  - Expo EAS build preview (optional)
- Chromatic/Storybook cloud for visual diffs (stretch goal).

## Code Review Expectations
- <300 lines per PR when possible.
- Include before/after screenshots or loom.
- Respond to feedback within 12 hours during hackathon.

## Release Coordination
- Nightly build tagged `ui-milestone1-<date>`.
- Maintain `docs/ui/changelog.md` summarizing merged features.

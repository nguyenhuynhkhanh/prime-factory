# Scenario: H-17 — Dark Factory self-onboarding produces sensible candidates

## Type
edge-case

## Priority
high — EC-7. The framework onboarding itself is a test of the full extraction pipeline.

## Preconditions
- Phase 3.7 is present.
- Target project is the Dark Factory repo itself.

## Action
This is an integration-style scenario. It runs the onboard-agent conceptually on the Dark Factory repo and asserts that Phase 3.7 would produce (at minimum):
1. **Invariants**:
   - Candidates from agent/skill `NEVER` / `MUST` / `ALWAYS` statements (expected dozens; e.g., `spec-agent NEVER reads holdout scenarios`, `promote-agent MUST update manifest`, etc.)
   - Candidates from the plugin-mirroring rule (every agent/skill/rule must exist in both `.claude/` AND `plugins/dark-factory/`)
   - Candidates from frontmatter naming rule (`name` must match filename)
   - All at `medium` confidence per BR-11.
2. **Decisions** sourced from `project-profile.md`:
   - Language/runtime choice (JavaScript CommonJS, Node.js 18+)
   - Test framework choice (Node built-in test runner)
   - Distribution model (npm + Claude Code plugin dual distribution)
3. **Ledger**: four entries backfilled from current `promoted-tests.json`:
   - adaptive-lead-count (promoted 2026-04-09)
   - token-measurement (promoted 2026-04-09)
   - playwright-onboard (promoted 2026-04-15)
   - playwright-test-hardening (promoted 2026-04-15)
   - sorted chronologically ascending.

Verification is performed by running (or simulating) Phase 3.7 and inspecting the proposed candidate lists BEFORE sign-off. The test asserts the list contains the expected categories (not exact counts).

## Expected Outcome
- At least N invariant candidates from agent markdown (N ≥ 10, reflecting the density of NEVER/MUST/ALWAYS rules across 9 agents).
- At least 3 decision candidates from project-profile.
- Exactly 4 ledger entries in the expected chronological order.

## Failure Mode (if applicable)
If self-onboarding produces zero candidates in any category, something is wrong with the extraction logic. If the ledger misorders entries, the sort rule is broken. If agent markdown extraction is skipped, BR-11 is violated.

## Notes
This scenario is the most realistic end-to-end test. It exercises the full pipeline on a known codebase (the Dark Factory repo) where the expected output can be anticipated.

# Scenario: H-17 — Best-of-N in a multi-spec wave uses per-spec worktree naming

## Type
edge-case

## Priority
high — EC-12. When multiple Tier 3 specs in quality mode run in the same wave, each gets its own Track A and Track B worktrees. Shared or conflicting worktree names would cause implementation failures.

## Preconditions
- `--mode quality` flag with a wave containing two Tier 3 specs: `spec-a` and `spec-b`.
- Both specs trigger Best-of-N.

## Action
Structural test verifies that `implementation-agent.md` documents per-spec worktree naming for multi-spec Best-of-N:
1. Worktree names include the spec name as a prefix: `{spec-name}-track-a` and `{spec-name}-track-b`.
2. For a two-spec wave: `spec-a-track-a`, `spec-a-track-b`, `spec-b-track-a`, `spec-b-track-b` — four distinct worktrees.
3. The worktrees are independent and do not share any state between specs.

## Expected Outcome
- All three assertions pass: per-spec naming, four distinct worktrees for two specs, isolation documented.

## Failure Mode (if applicable)
"Best-of-N in multi-spec wave should use per-spec prefixed worktree names (spec-a-track-a, spec-a-track-b, ...)."

## Notes
EC-12 explicitly defines this. The Serena setup (`.serena/project.yml` with absolute worktree path) also applies per-worktree here — each of the four worktrees gets its own Serena scope file.

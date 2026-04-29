# Scenario: H-01 — Best-of-N: Track A passes, Track B fails — Track A promoted

## Type
feature

## Priority
critical — FR-7, FR-8, FR-9, FR-10, EC-3. The most common Best-of-N outcome. Must verify worktree naming, independent validation, and correct promotion choice.

## Preconditions
- `--mode quality` flag passed to df-orchestrate.
- Spec under test has `Architect Review Tier: Tier 3`.
- Two worktrees created: `{spec-name}-track-a` and `{spec-name}-track-b`.
- Track A code-agent produced a passing implementation.
- Track B code-agent produced a failing implementation.
- Holdout validation ran independently against each track.

## Action
Structural test verifies that `implementation-agent.md` documents the Best-of-N promotion logic. Specifically:
1. The file contains language describing spawning two independent code-agents (Track A and Track B) for Tier 3 specs in quality mode.
2. The file describes running holdout validation independently per track.
3. The file documents the Track-A-passes / Track-B-fails outcome: "Track A promoted; log Track B failure in summary."
4. The worktree naming convention `{spec-name}-track-a` and `{spec-name}-track-b` is present.
5. The execution plan description states "Best-of-N" and "2 parallel code-agent tracks" (or equivalent) for Tier 3 / quality mode.

## Expected Outcome
- All five assertions pass.
- The manifest entry after promotion shows `"bestOfN": {"winner": "track-a", "loserResult": "failed-holdout"}`.

## Failure Mode (if applicable)
If the logic promotes Track B or neither: the test fails identifying which outcome path is incorrectly documented.

## Notes
This scenario also covers EC-3 (Track A passes, Track B fails — the variant where A wins). EC-4 (Track B passes, Track A fails) is in H-02.

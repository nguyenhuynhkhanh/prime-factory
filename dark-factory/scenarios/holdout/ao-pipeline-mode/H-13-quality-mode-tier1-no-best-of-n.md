# Scenario: H-13 — `--mode quality` with Tier 1 spec does NOT trigger Best-of-N

## Type
edge-case

## Priority
high — BR-4, EC-1. Best-of-N is gated on BOTH quality mode AND Tier 3. A Tier 1 spec in quality mode should use a single code-agent with Opus — not two tracks.

## Preconditions
- `--mode quality` flag passed.
- Spec under test has `Architect Review Tier: Tier 1`.

## Action
Structural test verifies that `implementation-agent.md` documents the dual-gate condition:
1. Best-of-N only activates when BOTH conditions are true: mode = quality AND tier = Tier 3.
2. Tier 1 specs in quality mode use a single code-agent with `claude-opus`.
3. The execution plan for a Tier 1 spec in quality mode should note: "Tier 1 spec — Best-of-N skipped (quality mode applies Opus only)" (or equivalent).

## Expected Outcome
- All three assertions pass.
- Tier 1 + quality = single Opus code-agent, no Track A/B worktrees.

## Failure Mode (if applicable)
"implementation-agent.md should document that Tier 1 specs in quality mode skip Best-of-N and use single Opus code-agent."

## Notes
EC-1 explicitly requires the execution plan to note the Best-of-N skip for Tier 1. This prevents developer confusion when they choose quality mode and don't see two tracks.

# Scenario: H-24 — Crash mid-sign-off: re-run treats as fresh bootstrap, no partial state recovery

## Type
failure-recovery

## Priority
medium — EC-16. Sessions crash; state recovery would be complex and error-prone.

## Preconditions
- onboard-agent file documents session behavior.

## Action
Structural test asserts Phase 3.7 / Phase 7 Memory Sign-Off:
1. Do NOT persist partial sign-off state between sessions (no `.sign-off-progress.json` or equivalent).
2. On re-run after a crashed session, the agent inspects `dark-factory/memory/*` as they exist on disk and decides bootstrap vs refresh per-file (H-13 behavior).
3. If a previous session partially wrote a memory file before crashing, the next run treats that file as the current baseline (refresh mode). Partial state is taken at face value.
4. The agent does NOT attempt to detect "was this a crashed session" — explicit session-continuation logic is out of scope.

## Expected Outcome
- No partial-session state persistence.
- Current on-disk state is authoritative.
- No crash-detection heuristics.

## Failure Mode (if applicable)
If the documentation describes a `.progress.json` or session-recovery mechanism, test fails — that is out of scope and adds complexity.

## Notes
Keeping this simple is a deliberate choice. If a session crashes, the developer can delete partially-written files by hand and re-run. The agent does not need to be clever about recovery.

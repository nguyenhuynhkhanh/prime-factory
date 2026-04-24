# Scenario: advisor mode runs one round, soft-capped ~60s, timeout is structured

## Type
feature

## Priority
high — bounded latency; no ping-pong.

## Preconditions
- test-agent.md edited.

## Action
Read test-agent.md's advisor-mode timing documentation.

## Expected Outcome
- Documented as one round max (no iteration with spec-agent).
- Soft cap of approximately 60 seconds wall-clock.
- On overage or error, returns structured `{ status: "timeout", partial: {...} }` or `{ status: "error", reason: <string> }`.
- spec-agent treats the partial advisory as optional (may still consume any completed categories).

## Notes
Covers FR-18, NFR-4, EC-18. Prevents advisor from becoming a new pipeline bottleneck.

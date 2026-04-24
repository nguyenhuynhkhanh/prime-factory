# Scenario: Architect probe re-runs in round 2 after spec-agent respawn adds new candidates

## Type
edge-case

## Priority
high — round-by-round re-verification

## Preconditions
- Memory contains `INV-0070` (domain: security, status: active)
- Round 1 architect review: spec declares one candidate `INV-TBD-a` (properly formed). Review is APPROVED WITH NOTES (a non-blocking concern about rate limiting).
- Round 1 spec-agent respawn: responds to the concern by ADDING `INV-TBD-b` (a new rate-limiting invariant candidate) AND introduces a minor change that violates `INV-0070`
- Round 2 architect spawns

## Action
Round 2 architect-agents (all three domains, per-domain) run the probe against the updated spec.

## Expected Outcome
- Security-domain architect probe sees:
  - `INV-0070` — now violated by the round-1 spec change → BLOCKER
  - `INV-TBD-b` — new candidate → reviewed (fields complete or incomplete, per its actual content)
- `INV-TBD-a` is re-validated (previously accepted, still valid) → listed under `New candidates declared`.
- The probe does NOT assume "round 1 was fine, skip probe in round 2" — every round re-runs the probe against the current spec text.
- Status returns to BLOCKED until the new violation is resolved.
- spec-agent respawn in round 3 addresses the INV-0070 violation (declares modification with rationale OR changes the plan).

## Notes
Validates FR-6 (probe re-runs), EC-6. The architect-agent prompt must explicitly state that the probe is performed ON EACH ROUND, not only in round 1.

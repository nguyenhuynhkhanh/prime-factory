# Scenario: Round 2 begins but round 1 summary file is missing — graceful fallback

## Type
failure-recovery

## Priority
high -- if round 2 fails hard on a missing summary, the entire review pipeline halts mid-review; graceful fallback is non-negotiable

## Preconditions
- A Tier 2 spec is under review
- Round 1 has completed and spec-agent updated the spec
- The round 1 summary file at `dark-factory/results/{name}/review-architecture-round1-summary.md` was NOT written (e.g., architect-agent crashed or was interrupted after producing its findings but before writing the summary)
- The architecture domain architect is about to start round 2

## Action
Architecture domain architect-agent begins round 2. It attempts to read the round 1 summary before reviewing the updated spec.

## Expected Outcome
- Architect reads `dark-factory/results/{name}/review-architecture-round1-summary.md` — file not found
- Architect logs internally: "No summary found for round 1 — proceeding without handoff note"
- Architect does NOT fail, throw an error, or stop the review
- Architect proceeds to read the updated spec directly (as if it were round 1 without a prior summary)
- Architect completes its round 2 review and produces findings
- After round 2 completes, architect writes the round 2 summary to `dark-factory/results/{name}/review-architecture-round2-summary.md` (compensating for the missing round 1 summary by being thorough in its "Resolved this round" section)

## Notes
Validates FR-8 (missing summary = graceful fallback), EC-4 (missing summary file). This is holdout because a code-agent that sees it might hard-code a "check if file exists before reading" pattern — we want to verify the graceful behavior emerges from the architect's behavioral instructions, not a brittle try/catch.

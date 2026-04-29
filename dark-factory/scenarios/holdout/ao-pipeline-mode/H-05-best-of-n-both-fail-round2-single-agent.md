# Scenario: H-05 — Best-of-N both fail → Round 2 runs as single code-agent with combined diagnosis

## Type
failure-recovery

## Priority
critical — FR-10, EC-5. The both-fail path is the hardest to implement correctly: it must merge two failure summaries, reduce to a single agent, and correctly continue the retry loop.

## Preconditions
- `--mode quality` flag, Tier 3 spec.
- Both Track A and Track B holdout validations fail.
- Both failure summaries are available.

## Action
Structural test verifies that `implementation-agent.md` documents the both-fail outcome:
1. "Both fail → merge failure summaries into combined diagnosis."
2. "Enter Round 2 with a single code-agent" (not two tracks again).
3. The merged diagnosis is passed to the Round 2 code-agent (not just one track's failure).

## Expected Outcome
- All three assertions pass.
- The Round 2 code-agent receives enriched combined diagnosis from both tracks.

## Failure Mode (if applicable)
If Round 2 is documented to use two tracks again: "Both-fail path should enter Round 2 as single code-agent, not another Best-of-N."

## Notes
EC-5: if Round 2 also fails, normal failure handling applies (spec stays active, developer notified). Round count = 2 at that point (Round 1 Best-of-N + Round 2 single agent).

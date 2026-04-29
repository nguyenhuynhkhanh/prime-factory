# Scenario: H-06 — Best-of-N attempt counts as exactly 1 round against the 3-round max

## Type
edge-case

## Priority
high — FR-11, BR-6, DEC-TBD-b. The round counting rule is subtle. If Best-of-N counts as 2 rounds, a developer choosing quality mode exhausts their retry budget on the first attempt — defeating the purpose of the flag.

## Preconditions
- `--mode quality` flag, Tier 3 spec.
- Best-of-N ran (regardless of outcome: one-pass, both-pass, or both-fail).

## Action
Structural test verifies that `implementation-agent.md` documents:
1. "The Best-of-N attempt counts as 1 round (not 2) against the 3-round max."
2. The both-fail path specifically states the round counter increments by 1 after the Best-of-N attempt.
3. No language suggests the two tracks are each counted separately.

## Expected Outcome
- All three assertions pass.
- The 3-round max is still the cap; Best-of-N at Round 1 leaves 2 rounds remaining.

## Failure Mode (if applicable)
If the round counting language is absent or ambiguous: "implementation-agent.md must document that Best-of-N counts as 1 round against the 3-round max."

## Notes
Also covers EC-6 (both-fail diagnosis empty — fallback to original inputs). The EC-6 fallback is specifically tested here: verify `implementation-agent.md` documents: "If Best-of-N combined diagnosis is unavailable, run Round 2 with original spec inputs" (or equivalent).

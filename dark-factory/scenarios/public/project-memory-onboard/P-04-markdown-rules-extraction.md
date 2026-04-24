# Scenario: P-04 — Agent/skill markdown NEVER/MUST/ALWAYS statements are treated as invariant source with medium confidence

## Type
feature

## Priority
high — BR-11 requires self-onboarding (Dark-Factory-on-itself) to recognize its own declarative rules. Without explicit handling, these would be missed during extraction.

## Preconditions
- Phase 3.7a is present in the onboard-agent file.

## Action
Structural test asserts that the Phase 3.7a body mentions:
1. That `NEVER`, `MUST`, and `ALWAYS` statements in agent/skill markdown are invariant sources.
2. That these markdown-derived candidates default to `medium` confidence (not high).

The test must also verify the body mentions the Dark-Factory-on-itself self-onboarding context explicitly (e.g., "when onboarding Dark Factory itself" or equivalent).

## Expected Outcome
- All three declarative keywords (`NEVER`, `MUST`, `ALWAYS`) are explicitly listed as extraction signals.
- The `medium` confidence default is documented for markdown-derived candidates.
- The self-onboarding context is called out so the agent does not skip this source when processing the Dark Factory repo itself.

## Failure Mode (if applicable)
If any keyword is missing, or confidence level is wrong, or self-onboarding context is not mentioned, test names the missing element.

## Notes
The rationale is that agent markdown rules are declarative and structured, but they describe framework behavior rather than domain invariants — so medium confidence is appropriate. A developer reviewing these during sign-off will make the final call.

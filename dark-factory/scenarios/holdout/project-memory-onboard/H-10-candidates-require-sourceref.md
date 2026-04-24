# Scenario: H-10 — Candidates without concrete sourceRef are silently dropped

## Type
edge-case

## Priority
high — BR-2, BR-3. Prevents hallucinated entries.

## Preconditions
- Phase 3.7a and Phase 3.7b are present.

## Action
Structural test asserts:
1. Phase 3.7a explicitly states invariant candidates with no `sourceRef` (file:line) are **silently dropped** (not even presented during sign-off).
2. Phase 3.7b explicitly states decision candidates with no `sourceRef` (profile section) are **silently dropped**.
3. Both phases state that this dropping is silent — no developer prompt, no warning in the sign-off summary beyond a count ("N candidates dropped due to missing sourceRef").

## Expected Outcome
- Silent-drop rule documented in both phases.
- Summary count mentioned but no per-entry prompt.

## Failure Mode (if applicable)
If either phase is missing the silent-drop rule, test names it. If the documentation would present the developer with "a candidate has no source, accept anyway?" prompts, test fails — the presence of a source is a non-negotiable prerequisite.

## Notes
This prevents the agent from producing "invariant candidates" that are essentially guesses. A candidate without a file:line is not a candidate.

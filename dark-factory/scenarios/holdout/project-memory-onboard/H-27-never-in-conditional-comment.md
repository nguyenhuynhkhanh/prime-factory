# Scenario: H-27 — NEVER in a conditional comment: extracted with low confidence

## Type
edge-case

## Priority
low — EC-19. Linguistic ambiguity in markdown rules.

## Preconditions
- Phase 3.7a is present.

## Action
Structural test asserts Phase 3.7a documents:
1. The scan does NOT attempt to parse conditional clauses attached to NEVER/MUST/ALWAYS (e.g., "NEVER do X unless Y").
2. Such conditional markdown rules ARE still extracted, but marked `confidence: low` because the extracted rule does not capture the condition.
3. The candidate text should include the full sentence (not just the main clause) so the developer can see the condition during sign-off.

## Expected Outcome
- Conditional handling documented.
- Low confidence for conditional rules.
- Full-sentence inclusion documented.

## Failure Mode (if applicable)
If the documentation would skip conditional NEVER statements entirely, test fails — better to extract low-confidence than to drop signal. If the documentation would extract only the main clause and drop the condition, test fails — the developer needs full context.

## Notes
Natural language rule parsing is hard. The agent punts to low confidence rather than trying to interpret. The developer reviews the full sentence and decides.

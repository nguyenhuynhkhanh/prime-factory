# Scenario: P-06 — Conservative-bias positive and negative examples are documented

## Type
feature

## Priority
medium — FR-6 requires at least one positive and one negative example to guard against over-extraction. Without concrete examples, agents will interpret "medium depth" ambiguously.

## Preconditions
- Phase 3.7a is present.

## Action
Structural test extracts the Phase 3.7a body and asserts:
1. It contains at least one **positive** example of what IS an invariant (e.g., "schema requires X" or "non-null column").
2. It contains at least one **negative** example of what is NOT an invariant (e.g., "this endpoint returns 400 if X is missing" / "endpoint-local"/ an explicit statement that endpoint-local validation is NOT an invariant).
3. The two examples appear as a contrasted pair (within 500 characters of each other) so the guidance is unmissable.

## Expected Outcome
- Positive example present.
- Negative example present.
- Both are near each other (contrastive reading).

## Failure Mode (if applicable)
If either example is missing, test names the missing one. If they are too far apart in the text (potentially unrelated), test warns.

## Notes
The phrase `endpoint-local` is a strong signal for the negative example. The phrase `schema requires` or `required field` is a strong signal for the positive example.

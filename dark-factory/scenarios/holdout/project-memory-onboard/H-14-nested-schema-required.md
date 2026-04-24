# Scenario: H-14 — Nested schema required-field extraction

## Type
edge-case

## Priority
medium — EC-4. Real Mongoose/Zod schemas have nested structures.

## Preconditions
- Phase 3.7a is present.

## Action
Structural test asserts Phase 3.7a:
1. Documents that required-field detection applies to nested schema structures (Mongoose subdocuments, Zod `z.object().nested`, Prisma embedded types, Pydantic nested models).
2. Documents that nested required fields produce candidates with `sourceRef` pointing to the specific nested line (not the parent schema line).
3. Documents that nested candidates retain `confidence: high` (same as top-level required fields).

## Expected Outcome
- Nested handling is explicit.
- sourceRef granularity is specified.
- Confidence tier is preserved.

## Failure Mode (if applicable)
If nested handling is not documented, test names the omission. If the documentation suggests skipping nested structures, test fails.

## Notes
Skipping nested required fields would miss a large fraction of real domain invariants. The sourceRef pointing to the nested line (not parent) is important for incremental refresh accuracy.

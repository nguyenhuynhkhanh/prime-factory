# Scenario: P-03 — Invariant extraction scan sources are documented

## Type
feature

## Priority
high — FR-3 requires the scan allowlist to be explicit. Without it, code-agent cannot validate the rule against the documented shape.

## Preconditions
- `.claude/agents/onboard-agent.md` has Phase 3.7a written.

## Action
Structural test extracts the Phase 3.7a body (from the `3.7a` label heading to the start of `3.7b`) and asserts it contains references to ALL of the following scan sources:
- schema files — at least one of: `Mongoose`, `Sequelize`, `Prisma`, `Drizzle`, `SQLAlchemy`, `Pydantic`, `Zod`
- required-field markers — at least one of: `required: true`, `@NotNull`, `non-null`
- validation middleware — the phrase `validation middleware`
- guard clauses — the phrase `guard clause` (or `guard clauses`)
- agent/skill markdown declarative statements — at least one of: `NEVER`, `MUST`, `ALWAYS` (in the context of invariant extraction)

The test must also assert that the invariant candidate shape lists all required keys: `id`, `title`, `rule`, `scope.modules` (or `scope`), `source`, `sourceRef`, `domain`, `rationale`, `confidence`.

## Expected Outcome
- All scan-source phrases present within Phase 3.7a body.
- All candidate-shape keys mentioned within Phase 3.7a body.
- Test passes without false positives from other phases.

## Failure Mode (if applicable)
If a scan source is missing, the test names the missing source. If a candidate-shape key is missing, the test names the missing key.

## Notes
Extraction is string-match based. The exact phrase `validation middleware` must appear verbatim — this is an explicit documented source per FR-3.

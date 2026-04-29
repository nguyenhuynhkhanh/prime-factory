# Scenario: Domain vocabulary terms are not applied to spec template section headings

## Type
edge-case

## Priority
medium — over-zealous vocabulary substitution could corrupt spec structure

## Preconditions
- `spec-agent.md` updated per this feature
- Project profile contains:
  ```markdown
  ## Org Context
  - **Domain vocabulary**: spec = test case in our vocabulary; decision = product choice; migration = data backfill
  ```
- Developer asks spec-agent to write a spec for any feature

## Action
Spec-agent reads vocabulary:
- "spec" → "test case"
- "decision" → "product choice"
- "migration" → "data backfill"

These terms exactly match section headings in the spec template:
- `## Migration & Deployment`
- `## Decisions`
- (The word "spec" appears in file names)

Spec-agent writes the spec.

## Expected Outcome
- Section headings remain as specified in the spec template: `## Migration & Deployment`, `## Decisions`, etc. — they are NOT rewritten to `## Data Backfill & Deployment` or `## Product Choices`
- Vocabulary substitution applies only to prose content within sections, not to structural headings
- The spec file name remains `{name}.spec.md`, not `{name}.test-case.md`

## Failure Mode
If vocabulary is applied globally including to headings, the resulting spec would have non-standard section names that break parsers, architect-agents, and test assertions that look for specific headings.

## Notes
EC-2. The vocabulary application boundary (prose only, not headings/structure) must be explicit in the spec-agent instructions. This is a holdout scenario because the line between "prose" and "structure" is subtle and easy to implement incorrectly.

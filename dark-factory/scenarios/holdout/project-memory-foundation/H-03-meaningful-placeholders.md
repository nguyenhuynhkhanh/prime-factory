# Scenario: Skeleton placeholders are meaningful, not lorem ipsum or gibberish

## Type
edge-case

## Priority
high — BR-6 exists because lorem ipsum placeholders waste the schema-teaching opportunity and invite copy-paste errors.

## Preconditions
- All three memory files exist with TEMPLATE entries.

## Action
For each TEMPLATE entry in each file, extract the title (text after `: `) and the `rule` / `decision` / `summary` body text. Test each against a blocklist and a content-quality heuristic.

## Expected Outcome
- Titles do NOT contain any of: `lorem`, `ipsum`, `foo`, `bar`, `baz`, `placeholder title`, `example entry`, a bare empty string, or the literal word `TODO`.
- Body content for `rule` / `decision` / `summary` contains at least one real project-domain word such as `spec`, `memory`, `invariant`, `decision`, `promote`, `architect`, `agent`, or another identifiable Dark Factory concept.
- Each TEMPLATE title, if read out loud, describes a realistic invariant/decision/feature that could plausibly exist in a real project.

## Notes
Validates FR-6, BR-6, EC-7. This scenario catches the failure mode where a code-agent cargo-cults the structure but ships generic placeholder text.

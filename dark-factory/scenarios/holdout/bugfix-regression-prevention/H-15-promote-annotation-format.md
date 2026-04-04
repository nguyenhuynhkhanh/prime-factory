# Scenario: Promoted test annotation uses specific structured comment format

## Type
feature

## Priority
medium — Consistent format enables grep-searchability and potential future tooling

## Preconditions
- `.claude/agents/promote-agent.md` exists with the updated adaptation sections

## Action
Read `.claude/agents/promote-agent.md` and inspect the annotation format specification.

## Expected Outcome
- The annotation format uses structured comments with specific prefixes:
  - `// Root cause: {pattern description}`
  - `// Guards: {file:line, file:line, ...}`
  - `// Bug: {dark-factory-bugfix-name}`
- These annotations are added as a header block alongside (or extending) the existing `// Promoted from Dark Factory holdout: {name}` comment
- The format is human-readable and grep-searchable
- The annotation instructions apply to both unit tests and Playwright E2E tests

## Failure Mode
If the format is unstructured or inconsistent, the annotations lose their searchability and tooling potential.

## Notes
BR-8 specifies the format. The promote-agent already adds `// Promoted from Dark Factory holdout: {name}` — new annotations extend this.

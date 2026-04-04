# Scenario: Investigator C proportional output for complex bugs produces full analysis

## Type
edge-case

## Priority
medium — Verifies the other end of the proportional output spectrum (trivial case is P-05)

## Preconditions
- `.claude/skills/df-debug/SKILL.md` exists with the updated Investigator C prompt

## Action
Read `.claude/skills/df-debug/SKILL.md` and inspect the Investigator C prompt for guidance on complex bug output.

## Expected Outcome
- The prompt distinguishes between trivial and complex bug output
- For complex bugs (logic errors, shared-code patterns, concurrency issues), the prompt requires:
  - Full similar pattern listing with file:line references
  - Risk assessment for each pattern found
  - Complete search scope documentation
  - Detailed regression risk assessment
- The prompt does NOT cap the amount of detail for complex bugs (only variant scenario count is capped, not investigation output)

## Failure Mode
If proportional output guidance only covers the trivial case, complex bugs may also receive abbreviated analysis.

## Notes
BR-4 states "every bug gets systemic search." The proportional output is about output depth, not whether the search happens.

# Scenario: Debug-agent variant scenarios are explicitly required in BOTH public AND holdout

## Type
feature

## Priority
high — If variants are only in holdout, code-agent cannot design for them

## Preconditions
- `.claude/agents/debug-agent.md` exists with the updated scenario writing section

## Action
Read `.claude/agents/debug-agent.md` and inspect Phase 6 for the variant scenario split requirement.

## Expected Outcome
- The scenario writing section explicitly states that variant scenarios appear in BOTH:
  - Public scenarios (so the code-agent knows what variants to design for)
  - Holdout scenarios (for validation)
- The rationale for the split is stated or implied (code-agent needs visibility, holdout provides validation)
- The existing public/holdout distinction is preserved (public = reproduction, holdout = edge cases + regression)

## Failure Mode
If the variant split is not explicit, the debug-agent may default to putting all variants in holdout only, leaving the code-agent unaware of expected variant coverage.

## Notes
BR-7 mandates this split. The developer confirmed: "Variant scenarios: both public AND holdout."

# Scenario: Architect-agent bugfix review evaluates regression risk depth

## Type
feature

## Priority
high — The architect is the last gate before implementation; must catch symptom-only fixes

## Preconditions
- `.claude/agents/architect-agent.md` exists and contains the bugfix evaluation criteria

## Action
Read `.claude/agents/architect-agent.md` and inspect the "For bugfixes:" evaluation section.

## Expected Outcome
- The bugfix evaluation section explicitly includes:
  - Regression risk depth evaluation (does the diagnosis reach the actual root cause?)
  - Root-cause vs symptom distinction (is the proposed fix targeting the deeper enabling pattern?)
  - Whether similar patterns in the codebase are flagged
- The architect can BLOCK if a fix is clearly symptom-level only
- The evaluation is proportional: a simple typo does not need the same scrutiny as a shared utility logic bug
- The existing bugfix evaluation criteria are preserved (root cause depth, fix completeness, blast radius, cross-feature impact, regression risk, systemic patterns)

## Notes
The architect-agent already evaluates "Root cause depth" and "Systemic patterns" for bugfixes. This feature makes those evaluations more explicit and actionable with BLOCK power for mismatched risk/fix depth.

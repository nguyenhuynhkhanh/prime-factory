# Scenario: code-agent text has NEVER/MUST NOT rule against globbing dark-factory/scenarios/ broadly

## Type
edge-case

## Priority
critical — a code-agent edit that "simplifies" path handling could reintroduce broad globbing. The rule must be explicit, not just implied.

## Preconditions
- `src/agents/code-agent.src.md` and compiled `code-agent.md` have been modified per this spec.

## Action
Read `.claude/agents/code-agent.md`. Search for NEVER, MUST NOT, or explicit prohibition text related to broad scenario globbing.

Specifically check:
1. Is there a NEVER rule or equivalent that explicitly names `dark-factory/scenarios/` as a forbidden glob root?
2. Does the instruction to use `publicScenariosDir` appear in a NEVER/MUST block rather than just a "prefer" or "should" statement?

## Expected Outcome
- The compiled code-agent.md contains explicit prohibition language (NEVER, MUST NOT, or equivalent strong negative) against globbing `dark-factory/scenarios/` broadly.
- The prohibition appears in a prominent location (constraints section or near the holdout-barrier rule), not buried in a footnote.

## Failure Mode
If the rule is only "prefer to use publicScenariosDir" or "try to use the explicit path," it is weak enough for a future AI edit to rationalize away. The rule must be NEVER-strength.

## Notes
Validates FR-5, BR-2, EC-8, INV-TBD-b. Holdout because the strength of the phrasing (NEVER vs. "should") is a subtle distinction the code-agent may not self-test against.

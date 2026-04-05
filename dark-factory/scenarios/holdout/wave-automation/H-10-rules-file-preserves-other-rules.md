# Scenario: Rules file update preserves all other rules unchanged

## Type
regression

## Priority
high -- changing one line must not corrupt the rest of the rules file

## Preconditions
- `dark-factory.md` has been updated

## Action
Read the updated `.claude/rules/dark-factory.md`. Verify all sections are intact.

## Expected Outcome
- The following sections are completely unchanged:
  - Auto-Detection section (all trigger/no-trigger rules)
  - Available Commands section
  - Onboarding section
  - Feature Pipeline section
  - Bugfix Pipeline section
  - Lifecycle Tracking section
  - Directory section
- The Rules section has ONLY the one line changed (the "FULLY DECOUPLED" line)
- All other rules in the Rules section are unchanged:
  - "Every agent spawn is INDEPENDENT"
  - "NEVER pass holdout scenario content to the code-agent"
  - "NEVER pass public scenario content to the test-agent"
  - "NEVER pass test/scenario content to the architect-agent"
  - "Architect-agent reviews EVERY spec before implementation"
  - "Architect-agent communicates with spec/debug agents ONLY about the spec"
- The "Conversations that evolve into implementation" section is unchanged

## Failure Mode
N/A -- content assertion

## Notes
Validates BR-7. The rules file is loaded by every agent session. A corruption here could break the entire pipeline.

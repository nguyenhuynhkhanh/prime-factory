# Scenario: Incremental refresh shows changes before overwriting

## Type
feature

## Priority
high -- prevents silent overwriting of manual profile edits

## Preconditions
- The onboard-agent file exists at `.claude/agents/onboard-agent.md`

## Action
Read the onboard-agent file and verify it includes an incremental refresh mechanism.

## Expected Outcome
- The onboard-agent process includes logic for handling re-runs on an existing profile
- When a profile already exists, the agent must show what changed (section by section)
- The developer can accept or reject changes per section
- Rejected sections are preserved from the existing profile
- The incremental refresh behavior is documented as part of Phase 2 or the existing-profile check (currently Phase 1, Step 2)

## Notes
The current behavior (Phase 1 Step 2) asks "refresh or keep." The new behavior should instead analyze changes and present them granularly.

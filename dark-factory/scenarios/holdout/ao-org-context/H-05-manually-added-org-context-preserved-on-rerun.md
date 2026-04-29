# Scenario: Manually-authored Org Context (not created by onboard-agent) is preserved on re-run

## Type
edge-case

## Priority
high — some developers will add Org Context manually after initial onboard; re-run must still preserve it

## Preconditions
- `onboard-agent.md` updated per this feature
- Project was originally onboarded BEFORE this feature shipped (no Org Context question was asked)
- Developer manually added `## Org Context` to `project-profile.md` after the initial onboard:
  ```markdown
  ## Org Context
  > Added manually.
  - **Core values/priorities**: developer experience first
  - **Domain vocabulary**: workspace = tenant's isolated environment
  - **Team structure**: @platform-team owns all infra changes
  - **Open constraints**: SOC 2 Type II audit in progress — no third-party data sharing
  - **PR reviewer handles**: @platform-team
  ```
- Developer runs `/df-onboard` to refresh the profile (e.g., after adding a new service)

## Action
Onboard-agent detects existing profile (Phase 1 incremental refresh). It reads the profile and finds `## Org Context`.

Developer answers "N" (default) to "Org Context already exists — update it? (y/N)".

## Expected Outcome
- `## Org Context` section is preserved verbatim in the final profile
- The "manually added" comment and all 5 field values are unchanged
- No automatic re-format of the section to match template structure
- The rest of the profile (Tech Stack, Architecture, etc.) may be updated normally

## Failure Mode
If the agent only checks for "org context added by onboard-agent" (e.g., via a metadata marker) and not for the raw `## Org Context` heading, manually added sections would not be detected and would be overwritten.

## Notes
EC-3. The detection signal is the `## Org Context` heading itself, not any metadata annotation. This is a holdout scenario because the implementation might be tempted to use a sentinel comment to distinguish "agent-added" from "manually-added" sections.

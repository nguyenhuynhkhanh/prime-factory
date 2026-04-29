# Scenario: Org Context with only placeholder text is treated as effectively empty

## Type
edge-case

## Priority
high — developers who run onboard and see the template fields but don't fill them in will have placeholder text in their profiles

## Preconditions
- `spec-agent.md` updated per this feature
- Project profile contains:
  ```markdown
  ## Org Context
  > Optional. Capture organizational knowledge...
  - **Core values/priorities**: {What this team optimizes for...}
  - **Domain vocabulary**: {Project-specific jargon...}
  - **Team structure**: {Who owns what...}
  - **Open constraints**: {Legal/compliance/SLA...}
  - **PR reviewer handles**: {GitHub handles...}
  ```
- All field values are still the template placeholders (curly-brace format `{...}`)

## Action
The spec-agent reads the profile and encounters `## Org Context` with all fields still showing placeholder text.

## Expected Outcome
- Spec-agent does NOT emit placeholder text verbatim in the spec (e.g., "{What this team optimizes for...}" must not appear in spec prose)
- Spec-agent treats the section as effectively empty — no vocabulary applied, no compliance noted, no reviewer handles referenced
- Spec is written correctly without org context applied

## Failure Mode
If the agent copies placeholder text into spec prose, the resulting spec will contain literal `{...}` template brackets, which will be confusing and incorrect.

## Notes
EC-1. This is a holdout scenario because the code-agent, if not specifically instructed, might pass placeholder values through to spec prose. The correct behavior is to detect unmodified placeholders and treat as empty.

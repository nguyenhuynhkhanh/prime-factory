# Scenario: Empty or absent PR reviewer handles field produces no reviewer routing in spec

## Type
edge-case

## Priority
medium — graceful degradation; reviewer routing is a nice-to-have, not a requirement

## Preconditions
- `spec-agent.md` updated per this feature
- Project profile contains `## Org Context` but with empty or absent `PR reviewer handles`:
  ```markdown
  ## Org Context
  - **Core values/priorities**: quality over speed
  - **Domain vocabulary**: account = billing account
  - **Team structure**: flat team, no formal routing
  - **Open constraints**: none
  - **PR reviewer handles**:
  ```
  (Note: PR reviewer handles field is present but has no value after the colon)

## Action
Spec-agent reads the profile including the empty `PR reviewer handles` field. The agent writes a spec for a new feature.

## Expected Outcome
- Implementation Notes section of the spec does NOT contain a reviewer routing line
- No placeholder like `PR reviewers: ` (empty) appears in the spec
- No error or warning about missing reviewer handles
- All other Org Context data (vocabulary "account = billing account") is applied normally

## Failure Mode
If the agent emits a "PR reviewers: " line with an empty value, it creates a spec artifact that looks like a reviewer was supposed to be assigned but wasn't. This is worse than omitting the line entirely.

## Notes
EC-5. The correct behavior is: if the field value is empty or whitespace, treat as absent and omit entirely. This is a holdout scenario because the code-agent might emit the key regardless of whether the value is populated.

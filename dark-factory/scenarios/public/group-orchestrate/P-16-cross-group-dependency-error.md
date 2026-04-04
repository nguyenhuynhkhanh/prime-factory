# Scenario: Cross-group dependency detected in pre-flight validation

## Type
edge-case

## Priority
high -- validates pre-flight validation

## Preconditions
- Manifest contains:
  - `auth-api`: group "auth", dependencies ["billing-core"], status "active"
  - `billing-core`: group "billing", dependencies [], status "active"

## Action
Developer invokes: `/df-orchestrate --group auth`

## Expected Outcome
- Pre-flight validation detects cross-group dependency
- Error: "auth-api (group: auth) depends on billing-core (group: billing). Dependencies must be within the same group."
- No execution begins
- Manifest unchanged

## Notes
This validates FR-9, BR-7, and EC-10. Cross-group dependencies are a pre-flight error.

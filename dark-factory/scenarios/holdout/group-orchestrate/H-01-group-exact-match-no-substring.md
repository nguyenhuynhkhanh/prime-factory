# Scenario: --group uses exact match, not substring

## Type
edge-case

## Priority
high -- validates BR-1 exact match semantics

## Preconditions
- Manifest contains specs in two groups:
  - `auth-schema`: group "auth", dependencies [], status "active"
  - `auth-v2-schema`: group "auth-v2", dependencies [], status "active"

## Action
Developer invokes: `/df-orchestrate --group auth`

## Expected Outcome
- Only `auth-schema` is found (exact match on "auth")
- `auth-v2-schema` is NOT included (group "auth-v2" does not equal "auth")
- Execution plan shows only auth-schema

## Failure Mode
If substring matching is used, auth-v2-schema would be incorrectly included, mixing unrelated specs.

## Notes
This validates BR-1. Group matching must be strict equality.

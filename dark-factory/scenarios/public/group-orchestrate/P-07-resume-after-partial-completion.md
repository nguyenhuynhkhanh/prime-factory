# Scenario: Resume --group after partial completion shows completed specs as skipped

## Type
feature

## Priority
critical -- core resume behavior

## Preconditions
- Group "auth" originally had 3 specs: auth-schema, auth-api, auth-ui
- auth-schema has completed its full lifecycle and been REMOVED from manifest (cleanup done)
- Manifest contains:
  - `auth-api`: group "auth", dependencies ["auth-schema"], status "active"
  - `auth-ui`: group "auth", dependencies ["auth-api"], status "active"

## Action
Developer invokes: `/df-orchestrate --group auth`

## Expected Outcome
- Execution plan shows:
  ```
  Group: auth
  Wave 1: auth-schema -- already completed (skipped)
  Wave 2: auth-api (dependency auth-schema: satisfied)
  Wave 3: auth-ui (depends on: auth-api)
  ```
- auth-schema is NOT executed (it's not in the manifest)
- auth-api's dependency on auth-schema is treated as satisfied (BR-3: removed = completed)
- auth-api executes first, then auth-ui

## Notes
This validates FR-4, EC-3, and BR-3. The "already completed" display gives the developer confidence that the resume is correct.

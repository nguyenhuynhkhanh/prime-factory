# Scenario: Basic --all mode finds and executes all active specs grouped appropriately

## Type
feature

## Priority
critical -- core happy path for --all mode

## Preconditions
- Manifest contains 5 active specs:
  - `auth-schema`: group "auth", dependencies [], status "active"
  - `auth-api`: group "auth", dependencies ["auth-schema"], status "active"
  - `billing-core`: group "billing", dependencies [], status "active"
  - `billing-reports`: group "billing", dependencies ["billing-core"], status "active"
  - `fix-typo`: group null, dependencies [], status "active"
- All specs have spec files and scenario directories present

## Action
Developer invokes: `/df-orchestrate --all`

## Expected Outcome
- Execution plan displayed showing all groups and standalone specs:
  ```
  Group: auth
    Wave 1: auth-schema
    Wave 2: auth-api
  Group: billing
    Wave 1: billing-core
    Wave 2: billing-reports
  Standalone:
    fix-typo

  Parallel execution: auth wave 1 + billing wave 1 + fix-typo run simultaneously
  ```
- Independent groups and standalone specs run in parallel at the wave level
- auth-schema, billing-core, and fix-typo all start simultaneously
- After auth-schema completes, auth-api starts; after billing-core completes, billing-reports starts
- Developer confirms before execution begins

## Notes
This validates FR-2 and FR-12. Cross-group parallelism at the wave level is the key behavior.

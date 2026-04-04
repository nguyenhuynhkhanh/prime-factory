# Scenario: Multiple dependencies, some satisfied by removal and some still active

## Type
edge-case

## Priority
high -- validates BR-3 in a complex dependency graph

## Preconditions
- Manifest contains group "platform":
  - `platform-api`: group "platform", dependencies ["platform-schema", "platform-auth"], status "active"
  - `platform-auth`: group "platform", dependencies ["platform-schema"], status "active"
- `platform-schema` does NOT exist in manifest (completed and cleaned up)

## Action
Developer invokes: `/df-orchestrate --group platform`

## Expected Outcome
- platform-schema dependency is satisfied (removed from manifest = completed)
- platform-auth depends on platform-schema (satisfied) -- goes to wave 1
- platform-api depends on platform-schema (satisfied) AND platform-auth (active, must wait)
- Execution plan:
  ```
  Group: platform
  Wave 1: platform-schema -- already completed (skipped)
  Wave 2: platform-auth (dependency platform-schema: satisfied)
  Wave 3: platform-api (dependencies: platform-schema satisfied, platform-auth in wave 2)
  ```
- platform-auth executes first, then platform-api

## Failure Mode
If removed dependencies are not properly resolved, platform-api might wait forever for platform-schema.

## Notes
This validates BR-3 with mixed satisfied/active dependencies.

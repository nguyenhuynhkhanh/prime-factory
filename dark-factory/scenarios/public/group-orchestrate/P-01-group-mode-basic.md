# Scenario: Basic --group mode orchestrates all active specs in dependency order

## Type
feature

## Priority
critical -- core happy path for the primary new feature

## Preconditions
- Manifest contains 3 specs in group "auth-redesign":
  - `auth-data-model`: group "auth-redesign", dependencies [], status "active"
  - `auth-api`: group "auth-redesign", dependencies ["auth-data-model"], status "active"
  - `auth-ui`: group "auth-redesign", dependencies ["auth-api"], status "active"
- All 3 specs have spec files and scenario directories present
- No other specs in manifest

## Action
Developer invokes: `/df-orchestrate --group auth-redesign`

## Expected Outcome
- Orchestrator reads manifest and finds 3 active specs in group "auth-redesign"
- Execution plan displayed:
  ```
  Group: auth-redesign
  Wave 1: auth-data-model
  Wave 2: auth-api (depends on: auth-data-model)
  Wave 3: auth-ui (depends on: auth-api)
  ```
- Developer is asked to confirm before execution begins
- After confirmation, specs execute in wave order (wave 1 first, then wave 2, then wave 3)
- Each spec goes through the full orchestration cycle (architect review, code agents, test agent, promote, cleanup)

## Notes
This validates FR-1, FR-10, and FR-12. The execution plan must be shown before any work begins.

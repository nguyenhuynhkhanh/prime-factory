# Scenario: Dependency on a spec removed from manifest is treated as satisfied

## Type
feature

## Priority
high -- validates the core resume dependency resolution

## Preconditions
- Manifest contains:
  - `api-endpoints`: group "backend", dependencies ["data-model"], status "active"
- `data-model` does NOT exist in the manifest (it was completed, promoted, and cleaned up)
- `api-endpoints` spec and scenarios are present

## Action
Developer invokes: `/df-orchestrate --group backend`

## Expected Outcome
- Orchestrator finds `api-endpoints` as the only active spec in group "backend"
- Dependency `data-model` is not found in manifest -- treated as satisfied (not an error)
- Execution plan:
  ```
  Group: backend
  Wave 1: data-model -- already completed (skipped)
  Wave 2: api-endpoints (dependency data-model: satisfied)
  ```
- api-endpoints executes normally

## Notes
This validates BR-3. The manifest removes entries after cleanup, so absence means the spec completed its full lifecycle.

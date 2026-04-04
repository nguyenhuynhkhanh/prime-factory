# Scenario: Circular dependency detected and reported with cycle path

## Type
edge-case

## Priority
high -- validates pre-flight validation

## Preconditions
- Manifest contains group "bad-group":
  - `spec-a`: group "bad-group", dependencies ["spec-c"], status "active"
  - `spec-b`: group "bad-group", dependencies ["spec-a"], status "active"
  - `spec-c`: group "bad-group", dependencies ["spec-b"], status "active"

## Action
Developer invokes: `/df-orchestrate --group bad-group`

## Expected Outcome
- Pre-flight validation detects circular dependency
- Error: "Circular dependency detected: spec-a -> spec-c -> spec-b -> spec-a. Fix the dependency declarations in the manifest."
- No execution begins, no worktrees created
- Manifest unchanged

## Notes
This validates FR-9 and BR-6. Cycle detection must happen before any spec execution.

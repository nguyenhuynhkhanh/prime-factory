# Scenario: Self-dependency detected as circular dependency

## Type
edge-case

## Priority
medium -- validates EC-9

## Preconditions
- Manifest contains:
  - `broken-spec`: group "test", dependencies ["broken-spec"], status "active"

## Action
Developer invokes: `/df-orchestrate --group test`

## Expected Outcome
- Pre-flight validation detects self-referential dependency
- Error reported as circular dependency: "Circular dependency detected: broken-spec -> broken-spec"
- No execution begins

## Failure Mode
If self-dependencies are not checked, the wave resolver might infinite loop or produce an empty wave list.

## Notes
This validates EC-9 and BR-6. A self-dependency is a cycle of length 1.

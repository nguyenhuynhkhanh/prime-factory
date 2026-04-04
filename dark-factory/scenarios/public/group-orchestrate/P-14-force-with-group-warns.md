# Scenario: --force with --group produces warning but proceeds

## Type
edge-case

## Priority
medium -- validates --force semantics

## Preconditions
- Manifest contains specs in group "auth":
  - `auth-schema`: group "auth", dependencies [], status "active"

## Action
Developer invokes: `/df-orchestrate --group auth --force`

## Expected Outcome
- Warning: "--force has no effect with --group/--all (it only applies to explicit mode cross-group guard)."
- Execution proceeds normally (--force is ignored, not an error)
- auth-schema is orchestrated as usual

## Notes
This validates BR-8 and AC-7.

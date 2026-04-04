# Scenario: Standalone specs (null group) are independent in --all mode

## Type
edge-case

## Priority
high -- validates BR-2 null group handling

## Preconditions
- Manifest contains:
  - `auth-api`: group "auth", dependencies [], status "active"
  - `fix-typo`: group null, dependencies [], status "active"
  - `add-docs`: group null, dependencies [], status "active"
  - `fix-css`: dependencies field missing entirely, group field missing entirely, status "active"

## Action
Developer invokes: `/df-orchestrate --all`

## Expected Outcome
- auth-api grouped under "auth"
- fix-typo, add-docs, and fix-css all treated as standalone (independent)
- fix-css has missing fields, treated as group: null, dependencies: [] (backward compat)
- All 4 specs can run in parallel (auth wave 1 + 3 standalone specs)
- Standalone specs are NOT grouped together -- each is its own independent unit

## Failure Mode
If standalone specs are incorrectly grouped together, they might be sequenced unnecessarily. If missing fields cause errors, backward compatibility is broken.

## Notes
This validates BR-2 and FR-7. Null group means standalone, not "default group."

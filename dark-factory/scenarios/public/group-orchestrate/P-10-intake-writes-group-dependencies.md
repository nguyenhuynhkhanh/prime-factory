# Scenario: /df-intake always writes group and dependencies to manifest

## Type
feature

## Priority
high -- validates manifest field enforcement

## Preconditions
- Empty manifest (no features)
- Developer runs `/df-intake` for a feature that decomposes into 2 sub-specs

## Action
Developer runs `/df-intake "add user profiles"` which decomposes into:
- `user-profiles-schema` (foundation, no dependencies)
- `user-profiles-api` (depends on user-profiles-schema)

## Expected Outcome
- Manifest updated with both entries:
  ```json
  {
    "user-profiles-schema": {
      "type": "feature",
      "status": "active",
      "group": "user-profiles",
      "dependencies": [],
      ...
    },
    "user-profiles-api": {
      "type": "feature",
      "status": "active",
      "group": "user-profiles",
      "dependencies": ["user-profiles-schema"],
      ...
    }
  }
  ```
- Both entries have `group` field (non-null for decomposed specs)
- Both entries have `dependencies` field (array, possibly empty)
- A single standalone spec (not decomposed) would have `group: null` and `dependencies: []`

## Notes
This validates FR-6 and FR-11. The intake must always write these fields, not leave them undefined.

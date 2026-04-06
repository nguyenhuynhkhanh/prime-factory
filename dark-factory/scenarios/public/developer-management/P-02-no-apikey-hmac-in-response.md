# Scenario P-02: API response never includes apiKey or hmac

## Type
feature

## Priority
critical — credential leakage is the primary security risk for this feature

## Preconditions
- Org "acme" exists with `orgId = "org-acme"`
- CTO has a valid session cookie
- One install exists for org-acme with known `apiKey` and `hmac` values stored in D1

## Action
```
GET /api/v1/dashboard/installs
Headers:
  Cookie: session=<valid-session-id>
```

## Expected Outcome
- HTTP 200
- Response body is a JSON object with an `installs` array
- For every object in the `installs` array:
  - The key `apiKey` is absent (not `null`, not empty string — completely absent from the object)
  - The key `hmac` is absent
- The response body, when serialised to a string, does NOT contain the literal `apiKey` or `hmac`
  substrings at any depth

## Failure Mode
N/A — read-only.

## Notes
- This test should be run against the actual D1 query output to confirm no `SELECT *` is used.
- Both the API layer (explicit column list in SELECT) and the serialisation layer (allow-list
  destructuring before `JSON.stringify`) must enforce this. The test validates the end result,
  not the mechanism.

# Scenario H-02: apiKey absent even when SELECT * is accidentally used in a future refactor

## Type
edge-case

## Priority
critical — defence-in-depth; serialisation layer must strip credentials even if the query layer fails

## Preconditions
- Org "acme" exists with `orgId = "org-acme"`
- CTO has a valid session cookie
- Install exists with a known `apiKey` value: `"sk-test-1234567890abcdef"`

## Action
```
GET /api/v1/dashboard/installs
Headers:
  Cookie: session=<valid-session-id>
```
Simulate (in the test) that the query layer returns a row object that includes `apiKey` and
`hmac` fields (as if SELECT * were used), and verify the serialisation layer strips them before
the response is sent.

## Expected Outcome
- HTTP 200
- The serialised JSON response body, when searched for the string `"sk-test-1234567890abcdef"`,
  returns no match
- The keys `apiKey` and `hmac` do not appear anywhere in the response body

## Failure Mode
N/A

## Notes
- FR-2 and NFR-2 coverage.
- This tests the allow-list destructuring step that occurs before `JSON.stringify`. The test
  should inject a mock D1 row that includes `apiKey` and `hmac`, then verify the route handler
  strips them.
- This is a holdout scenario because the code-agent must implement the allow-list step
  independently — it should not be told to do so by seeing this scenario.

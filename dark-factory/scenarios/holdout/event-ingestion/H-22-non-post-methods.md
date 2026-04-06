# Scenario: H-22 — Non-POST methods return 405

## Type
edge-case

## Priority
medium — verifies FR-16; the route must only export POST

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h22"`, `id = "install-h22"`,
  `orgId = "org-xyz"`

## Action
Send GET, PUT, PATCH, DELETE requests to the same path:

```
GET /api/v1/events
Authorization: Bearer test-key-h22
```

```
PUT /api/v1/events
Authorization: Bearer test-key-h22
Content-Type: application/json
{}
```

```
DELETE /api/v1/events
Authorization: Bearer test-key-h22
```

## Expected Outcome
- All three requests return HTTP 405
- No row inserted for any of them

## Notes
Next.js App Router returns 405 automatically for HTTP methods that have no named export
in the route file. The spec requires only `export async function POST`. If the developer
accidentally also exports `GET` or others, this scenario catches it.

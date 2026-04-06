# Scenario: H-14 — promptText is absent from response even when event has a non-null promptText value

## Type
edge-case

## Priority
critical — promptText contains sensitive LLM prompt data and must never be exposed

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- 1 event seeded within last 7 days with `promptText = "You are a senior engineer. Implement the following feature: [CONFIDENTIAL_SPEC_CONTENT]"`
- The event has all other standard fields populated

## Action
```
GET /api/v1/dashboard/events
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 200
- `events` array contains 1 item
- The event object does NOT contain the key `promptText` — not as `null`, not as empty string, not at all
- The response body, when serialised to a string, does NOT contain the substring "promptText" or "CONFIDENTIAL"
- All other event fields are present and correct

## Notes
Verifies FR-11, BR-7. The SELECT must name columns explicitly — NOT `select(*)`. Defence-in-depth: even if someone adds `promptText` to the schema's event type later, it must not appear here because it is excluded at the Drizzle SELECT column list, not filtered after fetching.

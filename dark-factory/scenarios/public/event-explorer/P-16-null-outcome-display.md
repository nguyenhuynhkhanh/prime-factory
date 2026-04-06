# Scenario: P-16 — outcome=null renders as "—" in the UI

## Type
feature

## Priority
high — blank outcome cells look like a rendering error; "—" makes null explicit

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- 1 event with `outcome = null` (in-flight or abandoned without an outcome recorded), `startedAt` within last 7 days
- 1 event with `outcome = "success"`, `startedAt` within last 7 days

## Action
User views the Event Explorer page with no filters applied

## Expected Outcome
- API response: the null-outcome event has `"outcome": null` in the JSON
- API response: the success event has `"outcome": "success"`
- UI renders the null-outcome row's outcome column as "—"
- UI renders the success event's outcome column as "success" (or appropriate label)
- No empty cell, no "null" text, no undefined rendering

## Notes
Verifies FR-16, EC-8. The "—" is a UI-layer decision applied when the API returns `null`. The API should return `null`, not an empty string or omit the field.

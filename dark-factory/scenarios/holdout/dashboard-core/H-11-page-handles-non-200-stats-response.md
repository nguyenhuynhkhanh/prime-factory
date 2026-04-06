# Scenario H-11: Overview page handles non-200 stats API response without crashing

## Type
failure-recovery

## Priority
high — EC-9. The session cookie is validated by the layout, but the stats API call inside page.tsx runs after layout validation. In edge cases (session deleted between layout render and page render, D1 transient error), the stats fetch can fail.

## Preconditions
- A CTO user's session was valid when the layout rendered.
- The session is deleted from D1 before `page.tsx` fetches the stats API (simulating a race or D1 transient error).
- `GET /api/v1/dashboard/stats` returns HTTP 401 (session no longer valid).

## Action
The page component's internal fetch to `/api/v1/dashboard/stats` returns a non-200 response.

## Expected Outcome
- `page.tsx` does not throw an unhandled exception.
- The page either:
  a. Renders an error state / message to the user (e.g., "Could not load dashboard data. Please refresh."), OR
  b. Calls `redirect('/login')` if the response is 401.
- The page does NOT render a React error boundary crash (white screen / unhandled error).
- The server does not return HTTP 500 for the page request itself.

## Failure Mode
If `page.tsx` does `const stats = await res.json()` without checking `res.ok`, and then the response is `{ "error": "Unauthorized." }`, subsequent code that tries to read `stats.activeInstalls` will receive `undefined` — leading to rendering failures or incorrect empty states.

## Notes
The recommended pattern in `page.tsx`:
```ts
const res = await fetch('/api/v1/dashboard/stats', { ... });
if (!res.ok) {
  if (res.status === 401) redirect('/login');
  // else render error state
}
const stats = await res.json();
```
This scenario tests the `res.ok` guard is in place.

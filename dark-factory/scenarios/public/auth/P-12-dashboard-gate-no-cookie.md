# Scenario P-12: Dashboard layout redirects to /login when session cookie is absent

## Type
feature

## Priority
critical — the session gate is the only thing preventing unauthenticated access to the dashboard

## Preconditions
- The `(dashboard)/layout.tsx` is in place
- No `__Host-session` cookie is present in the request

## Action
Browser navigation (or direct HTTP GET) to any dashboard route, e.g.:
```
GET /dashboard
(no Cookie header)
```

## Expected Outcome
- HTTP 302 (or 307) redirect to `/login`
- The dashboard page body is NOT rendered or returned
- No D1 query for user data is made (session check fails fast on missing cookie)

## Failure Mode
N/A

## Notes
This is a Server Component redirect — it uses `redirect()` from `next/navigation` inside the layout. The redirect must happen before any dashboard data is fetched.

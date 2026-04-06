# Scenario: H-15 — Cache-Control: no-store present on all response types including errors

## Type
edge-case

## Priority
high — sensitive data must not be cached at any layer (CDN, browser, proxy)

## Preconditions
- CTO authenticated for success/auth-error cases
- No auth for the 401 case

## Action (4 separate requests)
```
1. GET /api/v1/dashboard/events                             (valid → 200)
2. GET /api/v1/dashboard/events?command=df-bad              (invalid command → 400)
3. GET /api/v1/dashboard/events                             (no cookie → 401)
4. GET /api/v1/dashboard/events?from=bad-date               (bad date → 400)
```

## Expected Outcome
- All 4 responses contain the header: `Cache-Control: no-store`
- No response omits this header regardless of status code
- No response has `Cache-Control: max-age=...` or any other caching directive

## Notes
Verifies FR-17. The `no-store` directive prevents Cloudflare CDN, browser cache, and any intermediate proxies from storing responses. This is mandatory because events are prompt-adjacent sensitive data.

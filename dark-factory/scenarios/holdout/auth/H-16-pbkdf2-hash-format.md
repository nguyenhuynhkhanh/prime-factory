# Scenario H-16: PBKDF2 hash format is self-describing (base64salt:base64key)

## Type
edge-case

## Priority
high — hash format determines future migration capability; a non-self-describing format cannot be migrated without a forced password reset

## Preconditions
- `lib/auth/password.ts` is implemented

## Action
Call `hashPassword("testpassword")` and inspect the return value (unit-level test or static analysis of the implementation).

## Expected Outcome
- Return value is a string matching the pattern `<base64>:<base64>` (two base64-encoded segments separated by `:`)
- The first segment decodes to 32 bytes (the random per-hash salt)
- The second segment decodes to 32 bytes (the PBKDF2-derived key)
- A fresh call to `hashPassword("testpassword")` produces a DIFFERENT salt (confirming randomness)
- `verifyPassword("testpassword", hash)` returns `true`
- `verifyPassword("wrongpassword", hash)` returns `false`

## Notes
NFR-1 in the spec. The salt must be per-hash random, not the global `API_KEY_SALT`. The `API_KEY_SALT` env var is for HMAC only and must not appear in password hashes.

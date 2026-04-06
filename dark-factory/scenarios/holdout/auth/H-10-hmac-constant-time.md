# Scenario H-10: Install HMAC comparison is constant-time

## Type
edge-case

## Priority
high — timing attack on HMAC comparison could allow brute-forcing the salt

## Preconditions
- An org exists with `id = "ORG_UUID"`
- `API_KEY_SALT` is set

## Action
Two requests sent in quick succession:
1. HMAC that differs in the first byte (early mismatch)
2. HMAC that differs in the last byte (late mismatch)

Measure response time for each.

## Expected Outcome
- Both requests return HTTP 403 with `{ "error": "invalid hmac" }`
- Response times for early-mismatch and late-mismatch are statistically indistinguishable
- The comparison does NOT use `===` on hex strings or short-circuit string comparison

## Failure Mode
If the comparison uses string `===` or `Buffer.compare` (which may short-circuit), the timing difference reveals information about the HMAC prefix.

## Notes
Implementation must use `crypto.subtle.verify()` with the HMAC algorithm (natively constant-time in Web Crypto) OR encode both values as `Uint8Array` and use a constant-time comparison. Alternatively, import the provided HMAC as a key and call `crypto.subtle.verify()` to compare — this is the recommended approach in Web Crypto environments.

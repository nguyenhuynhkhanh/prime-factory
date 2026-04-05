# Scenario: Health check strips line numbers from guard annotations before checking

## Type
edge-case

## Priority
medium — guard annotations commonly include line numbers

## Preconditions
- Promoted test file contains: `// Guards: src/auth/auth.service.js:42, src/auth/token.js:15`
- Both `src/auth/auth.service.js` and `src/auth/token.js` exist

## Action
Developer runs `/df-cleanup`

## Expected Outcome
- Health check parses the `// Guards:` line
- Splits by comma, trims whitespace
- For each entry, strips the `:NN` suffix (line number)
- Checks file existence for `src/auth/auth.service.js` and `src/auth/token.js`
- Both exist — no stale guard flags

## Notes
EC-13: The colon-number suffix is a line reference, not part of the filename.

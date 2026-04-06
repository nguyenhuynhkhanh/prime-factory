# Scenario: H-20 — promptText with multi-byte UTF-8 characters truncated at byte boundary

## Type
edge-case

## Priority
medium — verifies EC-14; byte-aware truncation of multi-byte characters

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h20"`, `id = "install-h20"`,
  `orgId = "org-xyz"`

## Action
Construct `promptText` as follows:
- Fill 65,533 bytes with ASCII `"A"` characters (65,533 bytes)
- Append a 4-byte UTF-8 emoji `"😀"` (U+1F600, encoded as 0xF0 0x9F 0x98 0x80)
- Total: 65,537 bytes (1 byte over the 65,536 limit)

```
POST /api/v1/events
Authorization: Bearer test-key-h20
Content-Type: application/json

{
  "command": "df-orchestrate",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "promptText": "<65533 × 'A'><😀>"
}
```

## Expected Outcome
- HTTP 201
- D1 row `prompt_text` byte length is <= 65,536 bytes
- D1 row does NOT contain a truncated/broken 4-byte sequence:
  - Acceptable outcome A: stored value is exactly 65,533 `"A"` characters (emoji dropped)
  - Acceptable outcome B: stored value is 65,536 bytes, which is 65,533 `"A"` + only the
    first 3 bytes of the emoji (the stored string may not be valid UTF-8 in this case —
    this is also acceptable per EC-14; the constraint is byte length, not string validity)
- The key constraint: `prompt_text` byte length must NOT exceed 65,536

## Notes
This scenario distinguishes a naive `str.slice(0, 65536)` character-count truncation
(which would store 65,536 *characters* = 65,536 bytes for ASCII + 4 bytes for emoji = 65,537 bytes
in the worst case... actually in this case slice(0, 65536) would include the emoji character
as the 65534th character for 65536 chars total = correct coincidentally) from a proper
byte-count approach.

The real failure mode to catch: if promptText were 65,533 `"A"` + 1 emoji `"😀"` + more text,
a character-count slice would still truncate at 65,536 *characters* which includes the emoji,
and the stored value would be 65,533 + 4 = 65,537 bytes — over the limit.

Build the test input as: 65,532 `"A"` + 1 emoji (65,532 + 4 = 65,536 bytes exactly, at limit)
then add 1 more `"A"` (= 65,537 bytes total). This forces the truncation to drop the trailing `"A"`.
Expected: `prompt_text` = 65,532 `"A"` chars + `"😀"` = 65,536 bytes.

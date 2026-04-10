# Scenario: H-01 — Post-Edit Verification Is Mandatory — Fallback on Verification Failure

## Type
edge-case

## Priority
critical — a naive implementation calls `replace_symbol_body` and trusts the return value. This scenario tests whether the agent performs the required post-edit Read to verify content. Without verification, silently wrong-position edits produce corrupted code that passes linting but fails at runtime.

## Preconditions
- `dark-factory/project-profile.md` contains: `| Serena MCP | detected — semantic queries enabled |`
- Serena MCP server is running
- code-agent has been spawned with `SERENA_MODE=full`
- The target file is `src/orders/order.service.js`, containing function `processOrder` starting at line 42
- Between the agent's warmup probe (which succeeds) and the `replace_symbol_body` call, the file has been written by another process (simulated by a test harness that modifies line offsets after the warmup)
- `replace_symbol_body` returns a success response but the actual edit landed at line 38 (wrong position) due to stale LSP index
- The function body at line 38 that was replaced belongs to a different function (`validateOrder`)

## Action
The code-agent:
1. Warmup probe: `find_symbol("processOrder")` → success, reports line 42
2. Calls `mcp__serena__symbol_overview` to see function signatures
3. Calls `mcp__serena__replace_symbol_body` for `processOrder` with the new implementation
4. `replace_symbol_body` returns success
5. Agent MUST read the relevant section of `src/orders/order.service.js` to verify

Verification reads the file and finds:
- The content at line 42 (original `processOrder` location) is UNCHANGED — `processOrder` still has the old body
- The content at line 38 (`validateOrder`) now contains the `processOrder` implementation (wrong function was replaced)

6. Agent detects verification failure (expected content not at expected location / symbol mismatch)
7. Agent falls back to Edit: uses Grep to locate `processOrder`, reads its current content, issues Edit with `old_string` / `new_string`
8. Agent re-reads to confirm the fallback Edit landed correctly

## Expected Outcome
- Step 4 (`replace_symbol_body`) succeeds with no error — this is the trap condition
- Step 5 (post-edit Read) IS performed — this is the required behavior
- The agent detects that `processOrder` was NOT correctly replaced (verification fails)
- The agent does NOT proceed assuming the edit was successful based solely on the Serena return value
- The agent falls back to Edit with Grep-located content
- The fallback Edit correctly replaces `processOrder` with the new implementation
- `validateOrder`'s corrupted content is also detected and restored (or the agent flags this to the developer)
- Final state: `processOrder` has the new implementation; `validateOrder` has its original body

## Failure Mode (if applicable)
A naive implementation that calls `replace_symbol_body` and proceeds without verification will pass the public scenario P-01 (where Serena works correctly) but fail this scenario. The public scenario does not simulate stale LSP index — only this holdout scenario does.

## Notes
Per EC-5: line number shifts after a correct edit are NOT a failure — if the replacement content matches the intended new body, verification passes regardless of position change. Failure is detected only when the content at the expected symbol does not match the intended replacement, OR when the edit landed at the wrong symbol entirely.

Per EC-2: if the Serena server crashes mid-session (after warmup), subsequent calls return errors. In that case, the agent falls back per-call to Grep+Read — this is a per-call fallback, not a session-level unavailability re-evaluation. Session-level unavailability was decided at warmup; mid-session errors trigger per-call fallback only.

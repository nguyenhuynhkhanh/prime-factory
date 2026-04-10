# Scenario: P-01 — Serena Available, Single Worktree — Symbol-Level Discovery and Edit

## Type
feature

## Priority
critical — this is the primary happy path that delivers the feature's core value: reduced token usage through symbol-level operations instead of full-file reads

## Preconditions
- `dark-factory/project-profile.md` contains: `| Serena MCP | detected — semantic queries enabled |`
- df-orchestrate is running a single-spec implementation (one worktree only)
- `.serena/project.yml` has been written to the worktree directory with `project_root: /absolute/path/to/worktree`
- Serena MCP server is running and responsive
- The spec requires modifying a function named `processOrder` in `src/orders/order.service.js`
- code-agent has been spawned with `SERENA_MODE=full` in its prompt context

## Action
The code-agent begins its implementation cycle:
1. Reads `dark-factory/code-map.md` for structural orientation — confirms `src/orders/order.service.js` is in the affected module (Layer 1)
2. Calls `mcp__serena__find_symbol` with `{"name": "processOrder"}` as the warmup probe (first Serena call of session)
3. Serena returns: file path `src/orders/order.service.js`, line range of the function
4. Warmup succeeds — Serena is marked available for this session
5. Calls `mcp__serena__symbol_overview` on `src/orders/order.service.js` to get all symbol signatures without reading the file body (Layer 2)
6. Uses `mcp__serena__replace_symbol_body` to replace the body of `processOrder` with the new implementation
7. Reads the relevant portion of `src/orders/order.service.js` to verify the edit landed correctly

## Expected Outcome
- Layer 1 (code-map.md) is consulted first — agent does NOT start with a raw Grep
- Warmup probe uses `find_symbol`, not `symbol_overview` or a mutation tool
- `symbol_overview` is called before `replace_symbol_body` — agent understands the file's symbol structure before mutating
- `replace_symbol_body` is called (mutation tool available because `SERENA_MODE=full`)
- A Read or targeted Grep of the file is performed AFTER `replace_symbol_body` to verify the edit
- The agent does NOT read the entire file before the edit (no full-file Read prior to the mutation)
- The final edit is correctly applied to the worktree file at `/absolute/path/to/worktree/src/orders/order.service.js`
- Token usage for this edit cycle: O(symbol size) rather than O(file size) — no full file content in context before the mutation

## Failure Mode (if applicable)
If `replace_symbol_body` is called but post-edit verification is skipped, the agent may proceed with a silently incorrect edit. The post-edit read is mandatory regardless of whether the mutation call reports success.

## Notes
This scenario establishes that the 3-layer policy is followed in order (code-map → Serena → Read/Grep). A correct implementation will NOT skip directly to Serena without consulting the code map first, and will NOT skip post-edit verification. The verification Read is what distinguishes a robust implementation from a naive one.

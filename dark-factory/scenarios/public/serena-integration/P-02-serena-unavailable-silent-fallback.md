# Scenario: P-02 — Serena Unavailable (Not Installed) — Silent Fallback to Grep+Read+Edit

## Type
feature

## Priority
critical — this is the fallback path that all users without Serena experience. If degradation is not silent, the feature breaks the pipeline for the majority of developers who have not installed Serena.

## Preconditions
- `dark-factory/project-profile.md` contains: `| Serena MCP | not detected — agents will use Read/Grep |`
- Serena MCP server is NOT installed or NOT running
- df-orchestrate is running a single-spec implementation
- `.serena/project.yml` has been written to the worktree directory (written by df-orchestrate regardless of Serena availability)
- code-agent has been spawned with `SERENA_MODE=full` in its prompt context
- The spec requires modifying the same `processOrder` function in `src/orders/order.service.js`

## Action
The code-agent begins its implementation cycle:
1. Reads `dark-factory/code-map.md` for structural orientation (Layer 1)
2. Reads project profile — detects `Serena MCP: not detected`
3. Skips the Serena warmup probe entirely (profile says not detected)
4. Falls back directly to Grep+Read for all discovery (Layer 3)
5. Greps for `processOrder` to find its location and context
6. Reads the relevant section of `src/orders/order.service.js`
7. Uses Edit (not `replace_symbol_body`) to apply the change with `old_string` / `new_string`

## Expected Outcome
- No Serena tool is called at any point during the session
- No error message is shown to the developer
- No warning is emitted about Serena being unavailable
- Pipeline output is indistinguishable from pre-Serena behavior
- The `processOrder` function is correctly modified using Edit
- All existing tests pass after the edit

## Failure Mode (if applicable)
If the agent attempts the warmup probe when the profile says not detected, it adds unnecessary latency for every session. If it surfaces an error or warning to the developer, it breaks the opt-in transparency contract.

## Notes
This scenario also covers EC-6: even if the profile says "detected" (Serena was available at onboard time) but the server is not running at agent session time, the warmup probe fails and the agent falls back gracefully. The observable behavior from the developer's perspective is identical to this scenario.

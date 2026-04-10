# Scenario: H-03 — LSP Warmup Probe — Session-Wide Binary Decision, No Per-Call Retry

## Type
edge-case

## Priority
high — this scenario tests a subtle behavioral requirement: the warmup probe is a ONE-TIME binary decision for the entire session. A naive implementation that re-probes on each Serena call, or that marks Serena unavailable for one call but retries on the next, passes public scenarios (where Serena is either fully available or fully unavailable) but fails this scenario (where availability changes mid-session in a specific way).

## Preconditions
- `dark-factory/project-profile.md` contains: `| Serena MCP | detected — semantic queries enabled |`
- code-agent has been spawned with `SERENA_MODE=full`
- The implementation task involves editing 3 functions: `functionA`, `functionB`, `functionC` in different files
- Serena MCP server is running BUT configured (by test harness) to return an EMPTY result for the warmup probe call on a known entry point (simulating a cold LSP that hasn't indexed the project yet)
- The warmup probe target is the project's known entry point (e.g., `scripts/init-dark-factory.js` → `init` function, or whatever the project profile lists as the primary entry point)

## Action
The code-agent begins its session:
1. Reads code-map.md for orientation (Layer 1)
2. Reads project profile — sees Serena detected
3. First Serena call: `mcp__serena__find_symbol({"name": "init"})` as warmup probe
4. Serena returns: empty result `[]` (no error, but no symbols found)
5. Agent evaluates: empty result on warmup probe → Serena unavailable for this session
6. Agent marks Serena as unavailable session-wide

For editing `functionA`:
7. Agent does NOT call any Serena tool (Serena is unavailable)
8. Agent uses Grep to find `functionA`
9. Agent reads the relevant file section
10. Agent uses Edit to apply the change

For editing `functionB`:
11. Agent does NOT re-probe Serena (session decision was made at step 5)
12. Agent uses Grep + Read + Edit directly

For editing `functionC`:
13. Same — no Serena call, Grep + Read + Edit

## Expected Outcome
- Warmup probe is called exactly ONCE (step 3), using `find_symbol` as the probe tool
- The empty result at step 4 triggers session-wide unavailability (step 5)
- NO Serena tool is called for steps 7-13 — the session decision holds
- The agent does NOT re-probe before editing `functionB` or `functionC`
- All three functions are correctly edited using Grep+Read+Edit
- Pipeline completes successfully with no errors or warnings to developer
- Total Serena tool calls for the entire session: exactly 1 (the warmup probe)

## Failure Mode (if applicable)
A naive implementation that re-evaluates Serena availability on each tool call (checking on-demand rather than session-wide) would probe 3 times instead of 1. This adds latency proportional to the number of edits and defeats the purpose of the binary session decision (which was designed to avoid per-call overhead). More critically, an implementation that retries after an empty probe may eventually succeed and produce inconsistent behavior within a session (some edits via Serena, some via Grep).

## Notes
Per BR-4: one probe, binary decision, no retries. This is a correctness requirement for the session model, not just a performance preference.

The warmup probe must use `find_symbol` specifically, not `symbol_overview` or a mutation tool. Using a mutation tool as the warmup probe would be dangerous (it could modify a file unintentionally) and would fail this scenario if the test harness checks which tool was used as the probe.

This scenario uses an empty result (not an error) to trigger unavailability. Per FR-9: both error AND empty result on the warmup probe trigger session-wide unavailability. Public scenario P-02 tests the error case (server not running). This holdout scenario tests the empty result case (server running but cold/unindexed).

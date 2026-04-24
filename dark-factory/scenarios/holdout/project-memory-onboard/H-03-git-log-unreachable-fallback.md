# Scenario: H-03 — Git log unreachable (not a git repo, shallow clone, permission denied): fail soft

## Type
failure-recovery

## Priority
high — NFR-3, FR-11. Onboard must not crash on non-standard git environments.

## Preconditions
- Phase 3.7c is present.

## Action
Structural test asserts the Phase 3.7c body explicitly documents at least two git-failure modes and their handling:
1. **Not a git repository** (e.g., target is a tarball or shallow sync): all ledger entries get `gitSha: null` with `[UNKNOWN SHA]` tag; backfill proceeds using `promoted-tests.json` data only.
2. **Shallow clone or missing commits**: the specific feature's cleanup commit may not be reachable; set `gitSha: null` for that entry only; other entries still resolve normally.
3. The fallback behavior is soft — ledger is still written, sign-off still happens, no exception thrown.

Additionally, the test verifies the body contains a phrase prohibiting the agent from modifying git state to "fix" the problem (e.g., cannot run `git fetch --unshallow` to try to recover).

## Expected Outcome
- Both failure modes documented.
- Soft-fail behavior documented.
- Explicit prohibition on git state modification.

## Failure Mode (if applicable)
If either failure mode is missing, test names it. If the agent's handling is described as "throw / block / prompt developer to fix git", test fails — the correct behavior is soft degrade.

## Notes
The agent must treat git log as an oracle, never as a tool it can modify. Shallow clones and CI sandboxes are common enough that hard-failing would be a real regression.

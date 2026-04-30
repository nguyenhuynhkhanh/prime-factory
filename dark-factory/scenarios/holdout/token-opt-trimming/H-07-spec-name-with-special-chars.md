# Scenario: H-07 — specName with special characters is safely handled in temp file path (EC-5)

## Type
edge-case

## Priority
low — Spec names in Dark Factory use kebab-case by convention (e.g., `token-opt-trimming`). However, if a spec name contains spaces or unusual characters, the shell command `npm test 2>&1 | tee /tmp/preflight-{specName}.tap` could fail or produce an unexpected path.

## Preconditions
- `src/agents/implementation-agent.src.md` has been updated.
- The pre-flight gate documentation addresses how `{specName}` is composed into the temp file path.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that the compiled `implementation-agent.md` pre-flight gate instructions either:
1. Note that specName should be sanitized/quoted in the shell command, OR
2. Document that spec names are kebab-case identifiers (no spaces, no shell-special chars) by convention, making this a non-issue.

## Expected Outcome
- The implementation either documents sanitization or relies on the documented naming convention.
- No shell injection risk for the temp file path is introduced.

## Failure Mode (if applicable)
If `specName` contains a space (e.g., `my feature`), the command `tee /tmp/preflight-my feature.tap` would be parsed by the shell as `tee /tmp/preflight-my` with `feature.tap` as a second argument, silently writing to the wrong path. This scenario verifies the implementation is aware of the risk.

## Notes
EC-5: Dark Factory spec names are by convention kebab-case (see manifest.json examples: `playwright-lifecycle`, `project-memory-onboard`, `token-opt-trimming`). The simplest mitigation is to document the convention rather than add quoting complexity. Either approach is acceptable — the test verifies awareness, not a specific implementation choice.

# Scenario: dark-factory-setup.test.js contains ao-thin-impl-agent test section with required assertions

## Type
edge-case

## Priority
high — the test file is the primary guard against future regressions. If the test section is missing or incomplete, the invariants introduced by this feature have no automated enforcement.

## Preconditions
- `tests/dark-factory-setup.test.js` has been updated per this spec.

## Action
Read `tests/dark-factory-setup.test.js`. Look for the `ao-thin-impl-agent` section (near the end of the file, after existing promoted sections).

## Expected Outcome
The section (within `DF-PROMOTED-START: ao-thin-impl-agent` / `DF-PROMOTED-END: ao-thin-impl-agent` markers) contains at minimum these assertions:

1. implementation-agent.md does NOT contain "Read spec file and all public scenario files" in its code-agent spawn section.
2. implementation-agent.md contains `specPath` in the code-agent spawn section.
3. implementation-agent.md contains `publicScenariosDir` in the code-agent spawn section.
4. implementation-agent.md contains `architectFindingsPath` in the code-agent spawn section.
5. implementation-agent.md contains findings file write language (e.g., `.findings.md`).
6. implementation-agent.md token count is ≤ 3,200.
7. code-agent.md contains self-load language for `specPath`, `publicScenariosDir`, and `architectFindingsPath`.
8. code-agent.md contains NEVER/MUST NOT language about broad `dark-factory/scenarios/` globbing.

## Failure Mode
A test section that exists but is superficial (e.g., only checks token cap, misses structural assertions) allows future drift of the handoff contract without detection.

## Notes
Validates AC-7. This is a meta-test — testing that the tests themselves are present and complete. Holdout because the code-agent may write a minimal test section that passes superficially but lacks the structural assertions listed here.

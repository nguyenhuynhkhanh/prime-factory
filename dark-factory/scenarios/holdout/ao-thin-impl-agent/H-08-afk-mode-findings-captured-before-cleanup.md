# Scenario: AFK mode — findings file content captured before Step 5 deletes it

## Type
edge-case

## Priority
medium — AFK mode creates a draft PR after cleanup. If the findings file (or spec content) is needed for the PR body, it must be captured before cleanup deletes it. The existing AFK ordering rule for spec content must extend to findings.

## Preconditions
- `src/agents/implementation-agent.src.md` has been modified per this spec.
- The AFK section of Step 5 describes pre-cleanup content capture.

## Action
Read `src/agents/implementation-agent.src.md`. Inspect the Step 5 (Cleanup) AFK section for the content-capture ordering.

## Expected Outcome
- The Step 5 AFK note captures spec content (already documented) before cleanup deletes the spec file.
- The findings file (`{name}.findings.md`) is also listed among artifacts to delete in Step 5.
- The ordering is: (1) capture any content needed for PR body → (2) delete spec, review files, findings file, scenarios, results → (3) commit cleanup → (4) create draft PR.
- The findings file deletion does not cause the AFK PR creation to fail if findings were not needed for the PR body.

## Notes
Validates EC-5. The existing AFK section in the current implementation-agent already has this ordering for the spec file. This scenario verifies the findings file does not break that ordering.

# Scenario: implementation-agent spawn brief contains specPath, publicScenariosDir, architectFindingsPath

## Type
feature

## Priority
critical — these three paths are the entire handoff contract between implementation-agent and code-agent. Missing any one of them means code-agent cannot self-load its required inputs.

## Preconditions
- `src/agents/implementation-agent.src.md` has been modified per this spec.

## Action
Read `src/agents/implementation-agent.src.md`. Inspect the Step 1 code-agent spawn section (Feature Mode) for the spawn brief parameters.

## Expected Outcome
- The spawn brief includes `specPath` (or equivalent named parameter for the spec file path).
- The spawn brief includes `publicScenariosDir` (or equivalent named parameter for the public scenarios directory path).
- The spawn brief includes `architectFindingsPath` (or equivalent named parameter for the findings file path).
- The spawn brief does NOT include the raw text content of the spec file.
- The spawn brief does NOT include the raw text content of any scenario file.

## Notes
Validates FR-2, AC-3, BR-1. This test is the primary guard for the path-passing contract. The exact parameter names must match what code-agent's self-load instructions reference.

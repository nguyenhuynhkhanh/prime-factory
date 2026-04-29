# Scenario: bugfix mode (red and green phase) uses path parameters, not inline content

## Type
edge-case

## Priority
high — bugfix mode has its own Step 1 (red phase) and Step 2 (green phase) spawn calls. If only feature mode was updated, bugfix mode retains the old inline-content pattern and the token savings are only partial.

## Preconditions
- `src/agents/implementation-agent.src.md` has been modified per this spec.

## Action
Read `src/agents/implementation-agent.src.md`. Inspect the Bugfix Mode section — specifically Step 1 (Red Phase) and Step 2 (Green Phase) code-agent spawn calls.

## Expected Outcome
- Bugfix Step 1 spawn brief references `specPath` (debug report path), `publicScenariosDir`, and `architectFindingsPath` as path parameters.
- Bugfix Step 1 does NOT say "Read debug report and all public scenario files" in the context of loading content to inline into the spawn brief.
- Bugfix Step 2 spawn brief follows the same path-passing pattern.
- The phrase "Read debug report and all public scenario files" is ABSENT from the Bugfix Mode code-agent spawn sections (this was the old pattern).

## Notes
Validates FR-8, EC-3. This is a holdout scenario because the code-agent will naturally focus on Feature Mode (it is the primary path described in the spec); Bugfix Mode is a secondary path that must be explicitly verified.

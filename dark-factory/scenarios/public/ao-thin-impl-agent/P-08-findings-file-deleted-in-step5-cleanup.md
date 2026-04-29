# Scenario: Step 5 cleanup includes deletion of the findings file

## Type
feature

## Priority
high — if findings files are not cleaned up, they accumulate in the repository and pollute the spec directory over time.

## Preconditions
- `src/agents/implementation-agent.src.md` has been modified per this spec.

## Action
Read `src/agents/implementation-agent.src.md`. Inspect the Step 5 (Cleanup) section for the list of files to delete.

## Expected Outcome
- The Step 5 delete list includes `dark-factory/specs/features/{name}.findings.md` (and the bugfix variant `dark-factory/specs/bugfixes/{name}.findings.md`, or a general pattern that covers both).
- The findings file deletion appears in the same cleanup sequence as the spec file, review files, scenario directories, and results directory.
- The findings file is listed before the commit step (so it is deleted and committed in the cleanup commit).

## Notes
Validates FR-7, BR-5, AC-9. Cleanup correctness is load-bearing for the pipeline's "no leftover artifacts" invariant.

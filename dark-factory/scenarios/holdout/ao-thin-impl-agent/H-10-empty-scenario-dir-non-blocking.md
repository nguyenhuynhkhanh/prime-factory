# Scenario: code-agent handles empty publicScenariosDir gracefully without error

## Type
edge-case

## Priority
medium — in early pipeline runs (spec just written, no scenarios populated yet) or for very small features with no public scenarios, the directory may be empty. Code-agent must not fail on glob returning zero results.

## Preconditions
- `src/agents/code-agent.src.md` or compiled `code-agent.md` has been modified per this spec.
- Simulated scenario: `publicScenariosDir` points to a directory that exists but contains no `.md` files.

## Action
Read `.claude/agents/code-agent.md`. Look for instructions about what code-agent should do when the glob of `publicScenariosDir` returns zero files.

## Expected Outcome
- The agent text specifies that zero scenario files is a valid (non-error) state.
- The agent text includes language like "log a warning and proceed without scenario context" rather than stopping or reporting an error.
- The overall implementation attempt continues — an empty scenario dir is not a blocker for code-agent.

## Failure Mode
If code-agent treats zero glob results as an error condition, implementations for features with no public scenarios will fail at startup, before any code is even written.

## Notes
Validates EC-7. Holdout because "empty directory" is an edge state the code-agent will not test for in its own happy-path scenarios.

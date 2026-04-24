# Scenario: test-agent mode defaults to validator; invalid mode refuses to proceed

## Type
edge-case

## Priority
critical — default preserves existing caller behavior; invalid input must not silently pick a mode.

## Preconditions
- test-agent.md edited.
- Existing callers (implementation-agent) spawn test-agent without a `mode` parameter (legacy invocation).

## Action
Read test-agent.md's mode-handling documentation.

## Expected Outcome
- If `mode` is absent → defaults to `validator` (preserves legacy behavior).
- If `mode` is `"validator"` → validator behavior.
- If `mode` is `"advisor"` → advisor behavior.
- If `mode` is any other string (e.g., `"validate"`, `"ADVISOR"`, `"test"`) → refuse to proceed; output error "Unknown mode `{value}` — legal values are `validator` or `advisor`"; exit.
- If both `mode: validator` AND `mode: advisor` are somehow provided → refuse to proceed; output error.

## Notes
Default to validator is essential for backward compatibility with implementation-agent, which doesn't know about the `mode` parameter in existing code paths.

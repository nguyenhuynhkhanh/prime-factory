# Scenario: Same test-agent invocation cannot be both advisor and validator

## Type
information-barrier

## Priority
critical — the mode isolation invariant.

## Preconditions
- test-agent.md edited.

## Action
Attempt (in a structural test) to find any test-agent invocation that combines validator + advisor behavior in a single pass.

## Expected Outcome
- test-agent.md explicitly states: "A single spawn processes exactly one mode."
- The process narrative branches at Step 0 based on `mode`, and the two branches are mutually exclusive (no shared code paths after the branch).
- No caller in the codebase spawns test-agent with mode parameters for BOTH modes simultaneously.
- Structural test greps all skill/agent files for `mode: advisor` AND `mode: validator` co-occurring in the same spawn block — asserts zero matches.
- Two distinct spawns in one message (separate Agent tool calls) are permitted — each is a separate invocation.

## Notes
Covers FR-19, BR-6, INV-TBD-b. Adversarial test looks for the prohibited pattern `mode: advisor` and `mode: validator` in the same Agent-tool invocation — must find zero.

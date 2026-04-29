# Scenario: implementation-agent source does not contain "read spec file and all public scenario files" in Step 1

## Type
feature

## Priority
critical — this is the primary removal assertion. If the old inline-read prose is still present, the token reduction was not achieved and the feature is incomplete.

## Preconditions
- `src/agents/implementation-agent.src.md` has been modified per this spec.
- Compiled `implementation-agent.md` is current.

## Action
Read `src/agents/implementation-agent.src.md`. Search for prose in the Step 1 (Feature Mode, code-agent spawn) section about reading spec file content or reading all public scenario files.

Also read compiled `.claude/agents/implementation-agent.md` and perform the same search.

## Expected Outcome
- Neither the source file nor the compiled file contains: "Read spec file and all public scenario files" (exact phrase from current Step 1).
- Neither contains equivalent prose instructing implementation-agent to read and then forward spec content to code-agent.
- The Step 1 section refers to paths or parameters only, not file content loading operations.

## Failure Mode
If the source or compiled file still contains "Read spec file and all public scenario files" or equivalent inline-read-and-forward prose, the implementation is incomplete. The old behavior would still load spec + scenario content into implementation-agent's context.

## Notes
Validates FR-3, BR-1, AC-1. This is a string-match assertion — the exact phrase check makes it robust against paraphrasing.

# Scenario: findings file is written to disk after architect review approves

## Type
feature

## Priority
critical — the findings file is the primary artifact introduced by this feature; if it is not written, code-agent cannot self-load architect decisions.

## Preconditions
- `src/agents/implementation-agent.src.md` has been modified per this spec.
- Compiled `implementation-agent.md` is current (built via `npm run build:agents`).
- A spec file exists at `dark-factory/specs/features/{name}.spec.md`.
- Architect review has completed with APPROVED result; `{name}.review.md` exists and contains "Key Decisions Made" and "Remaining Notes" sections.

## Action
Read `src/agents/implementation-agent.src.md`. Inspect the Step 0d section.

## Expected Outcome
- Step 0d contains language about writing the findings to a file path of the form `dark-factory/specs/features/{name}.findings.md`.
- The step specifies that the file is written BEFORE code-agent is spawned in Step 1.
- The language explicitly names the file (or a path pattern with `{name}`) and identifies it as containing the extracted "Key Decisions Made" and "Remaining Notes" content.
- The step does NOT say the findings are passed inline (as a string/text block) to code-agent.

## Notes
Validates FR-1, BR-3, AC-2, DEC-TBD-a. This is a structural test against the source file's prose — it verifies the process description, not the runtime behavior.

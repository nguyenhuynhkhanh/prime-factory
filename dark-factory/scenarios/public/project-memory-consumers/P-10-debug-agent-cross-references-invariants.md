# Scenario: debug-agent loads memory and cross-references root cause against invariants

## Type
feature

## Priority
medium — advisory; useful for production root-cause reports but not load-bearing on the pipeline

## Preconditions
- Memory contains `INV-0015` (`title: pagination-bounded-at-100-per-request`, domain: architecture)
- A bug is reported: "Dashboard list endpoint returns all 10,000 records and times out"
- debug-agent is spawned via df-debug

## Action
debug-agent performs Phase 2 (Investigate) and Phase 3 (Root Cause Analysis).

## Expected Outcome
- debug-agent reads `dark-factory/memory/invariants.md` in Phase 2 alongside profile/code-map (FR-13).
- In Phase 3 Root Cause Analysis, debug-agent identifies the root cause (missing pagination limit).
- The debug report includes a one-line note in the Root Cause section:
  ```
  This bug is an invariant violation: INV-0015 (pagination-bounded-at-100-per-request) — the endpoint returns unbounded results, violating the bound.
  ```
- The debug report template structure is otherwise unchanged. No new section is added; the note is embedded inline in the existing Root Cause content.
- The plugin mirror of debug-agent.md contains byte-identical load + cross-reference language.

## Notes
Validates FR-13, FR-14, EC-11, AC-8, AC-9. If no matching invariant is found, the debug report proceeds normally with no invariant note. The cross-reference is advisory; it does not change the fix approach.

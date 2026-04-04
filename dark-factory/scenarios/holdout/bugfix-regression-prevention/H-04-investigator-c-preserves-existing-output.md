# Scenario: Investigator C restructured prompt preserves existing output sections

## Type
regression

## Priority
high — Existing sections (Edge Cases, Systemic Issues, Root Cause Hypothesis, Evidence) must not be lost

## Preconditions
- `.claude/skills/df-debug/SKILL.md` exists with the updated Investigator C prompt

## Action
Read `.claude/skills/df-debug/SKILL.md` and inspect the Investigator C prompt for both new and existing output sections.

## Expected Outcome
- The Investigator C prompt still requires the following existing sections (or their evolution):
  - Similar Patterns Found (existed before, now with file:line refs)
  - Edge Cases (existing)
  - Systemic Issues (existing)
  - Root Cause Hypothesis (existing)
  - Evidence with file:line references (existing)
- The prompt also includes the NEW required sections:
  - Search Scope
  - Classification
  - Regression Risk Assessment
- No existing output section is dropped or silently renamed
- The prompt maintains the `>` blockquote format

## Failure Mode
If existing sections are dropped, Investigator C's output becomes incomplete and the synthesis step loses dimensions.

## Notes
The current prompt says: "output your findings as a structured report with these sections: Similar Patterns Found, Edge Cases, Systemic Issues, Root Cause Hypothesis, Evidence (with file:line references)." All of these must be preserved.

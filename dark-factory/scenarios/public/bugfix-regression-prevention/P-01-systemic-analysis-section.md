# Scenario: Debug report template contains Systemic Analysis section

## Type
feature

## Priority
critical — This is the core structural addition that enables pattern intelligence to flow through the pipeline

## Preconditions
- `.claude/agents/debug-agent.md` exists and contains the debug report template

## Action
Read `.claude/agents/debug-agent.md` and inspect the debug report template (the markdown code block in Phase 5).

## Expected Outcome
- The debug report template contains a "## Systemic Analysis" section (or "### Systemic Analysis" depending on heading level within the template)
- Under Systemic Analysis, there is a "Similar Patterns Found" subsection that specifies file:line references, description, and risk assessment for each pattern
- Under Systemic Analysis, there is a "Classification" subsection specifying isolated incident vs systemic pattern
- The section explicitly states that similar patterns are listed for awareness only and the developer decides whether to fix them
- The Systemic Analysis section appears AFTER the existing "Impact Analysis" section and BEFORE the existing "Proposed Fix" section
- No existing sections in the template are renamed or removed

## Notes
The Systemic Analysis section is the primary structural fix — Investigator C already gathers this data but the report template had no place for it. Verify the section is positioned logically within the existing template flow.

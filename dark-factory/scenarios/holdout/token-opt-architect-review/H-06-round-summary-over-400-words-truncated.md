# Scenario: Round summary exceeds 400-word budget and is truncated

## Type
edge-case

## Priority
medium -- summary budget enforcement prevents the summarization mechanism from ballooning into a new token cost center

## Preconditions
- A Tier 3 spec with many findings is under review
- The architect completed round 1 and found numerous concerns across multiple subsystems
- The architect attempts to write a comprehensive round 1 summary that would exceed 400 words if all findings were fully described

## Action
Architect writes the round 1 summary to `dark-factory/results/{name}/review-security-round1-summary.md`.

## Expected Outcome
- The summary is truncated to fit within 400 words
- Truncation prioritizes: (1) "Open blockers" section preserved in full (most critical for next round), (2) "Key decisions made" preserved in full, (3) "Resolved this round" items abbreviated if needed (just the topic name, not the explanation), (4) "Next round focus" abbreviated if needed
- The summary file ends with a trailing note: "[Summary truncated to 400-word limit. Full findings in review output.]"
- The round 1 review output (the main `.review-{domain}.md` file or the spec-agent spawn notes) retains the full findings — only the summary is truncated
- At round 2 start, the architect reads the truncated summary and notes the truncation indicator — it reads the round 1 review output for the suppressed details if needed

## Notes
Validates EC-7 (summary exceeds 400 words), NFR-3 (round summary budget). Holdout because the truncation priority order (blockers first, resolved items last) is a non-obvious design decision that a code-agent seeing this scenario might hard-code as a special case.

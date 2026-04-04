# Scenario: Incremental refresh correctly merges accepted and rejected sections

## Type
edge-case

## Priority
high -- validates the most complex incremental refresh behavior

## Preconditions
- The onboard-agent file exists at `.claude/agents/onboard-agent.md`
- The incremental refresh behavior is documented (FR-4)

## Action
Read the onboard-agent file. Verify the incremental refresh instructions handle the mixed accept/reject case.

## Expected Outcome
- The instructions describe a per-section accept/reject flow
- For accepted sections: the new analysis replaces the old content
- For rejected sections: the existing profile content is preserved unchanged
- The final merged profile maintains correct section ordering
- The instructions explicitly mention that rejected sections keep the OLD content from the existing profile (BR-3: preserves manual edits)

## Failure Mode (if applicable)
If the merge logic is unclear, the agent might drop rejected sections entirely (instead of keeping old content) or duplicate sections in the output.

## Notes
This is the hardest part of incremental refresh. The instruction must be precise enough for the agent to produce a coherent merged profile.

# Scenario: Round summary is written after each round and read at the start of the next

## Type
feature

## Priority
high -- round summarization is the third token savings mechanism; incorrect file paths or missing writes break handoff between rounds

## Preconditions
- A Tier 2 spec exists (3 domain agents, 2 rounds minimum)
- `architect-agent.md` has been updated with round summarization protocol
- Round 1 has been completed for the Security domain architect
- The spec has been updated by the spec-agent based on round 1 Security findings
- Round 2 is about to begin for the Security domain architect

## Action
The Security domain architect completes round 1 and prepares to begin round 2.

## Expected Outcome
**After round 1 completes:**
- Architect writes a round summary to `dark-factory/results/{name}/review-security-round1-summary.md`
- The summary file contains all four required sections: "Resolved this round", "Open blockers (must address next round)", "Key decisions made", "Next round focus"
- The summary is ≤ 400 words

**At the start of round 2:**
- Architect reads `dark-factory/results/{name}/review-security-round1-summary.md` BEFORE reviewing the updated spec
- Architect uses the "Open blockers" and "Next round focus" sections to direct its round 2 review
- Architect does NOT re-read the full round 1 conversation transcript

**Round 1 summary — exact path check:**
- File path matches pattern: `dark-factory/results/{name}/review-{domain}-round{N}-summary.md`
- Domain slug for Security & Data Integrity: `security`
- Domain slug for Architecture & Performance: `architecture`
- Domain slug for API Design & Backward Compatibility: `api`
- Domain slug for Tier 1 combined agent: `combined`

## Notes
Validates FR-7 (summary written after each round), FR-8 (summary read at round start), BR-5 (summary mandatory). The path pattern is load-bearing — the implementation-agent and architect-agent both reference it by convention.

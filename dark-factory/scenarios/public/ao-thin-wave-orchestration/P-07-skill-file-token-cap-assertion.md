# Scenario: P-07 — df-orchestrate SKILL.md is within the 3,500-token (14,000-character) cap

## Type
feature

## Priority
critical — the file-size cap is the structural tripwire that ensures the orchestrator never grows too large to use in context; if the cap test is missing or too loose, future edits silently erode the token budget guarantee.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` has been updated per this spec
- `tests/dark-factory-setup.test.js` has a new `DF-PROMOTED-START: ao-thin-wave-orchestration` section with a token-cap assertion

## Action
Run `node --test tests/dark-factory-setup.test.js` and observe the token-cap assertion within the `ao-thin-wave-orchestration` promoted section.

## Expected Outcome
- The test suite passes
- The token-cap assertion reads `.claude/skills/df-orchestrate/SKILL.md` via `fs.readFileSync`, measures `content.length`, and asserts it is ≤ 14,000 characters (≈ 3,500 tokens at ~4 chars/token)
- The test section header comment includes: `DF-PROMOTED-START: ao-thin-wave-orchestration`
- The SKILL.md file is within the cap after the wave orchestration changes are applied

## Failure Mode
If the SKILL.md grows beyond 14,000 characters, the token-cap assertion fails and the test suite exits non-zero. This is the intended behavior — it surfaces the violation immediately.

If the assertion is too loose (e.g., 100,000 characters), it provides no protection.

## Notes
FR-10: SKILL.md ≤ 3,500 tokens. NFR-1: combined token cost bounded at ≤ 20,000 tokens for any realistic wave (100 specs × 50 chars/result = 5,000 + SKILL.md 14,000 = 19,000 — within budget). EC-6: large wave (100 specs) is covered by the static calculation, not by a runtime scenario. AC-9: SKILL.md ≤ 3,500 tokens enforced by test. AC-10: test section exists with correct markers.

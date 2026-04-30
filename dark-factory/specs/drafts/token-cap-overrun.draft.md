# Draft: token-cap-overrun

## Status
Raw draft — not yet specced. Come back when ready.

## Problem
Three agent files exceed their enforced token caps as of 2026-04-30:
- `onboard-agent.md`: 6445 tokens, cap 5500 (over by 945)
- `spec-agent.md`: 5806 tokens, cap 5500 (over by 306)
- `architect-agent.md`: 5269 tokens, cap 5000 (over by 269)

These cause 3 failing tests in `tests/dark-factory-setup.test.js` (Token cap enforcement suite).
Pre-flight test gate was bypassed with `--skip-tests` for `factory-redesign-v2` due to these failures.

## Likely Cause
`factory-redesign-v2` added significant new content to `spec-agent.md` and `architect-agent.md`
(draft-first loop, ADR writing, drift check, coverage-map-only review). The caps predate these
additions and were not raised as part of the redesign.

## Options to resolve
1. Raise the caps to reflect the new intended sizes — update test assertions.
2. Trim agent files to fit within existing caps — restructure or remove redundant prose.
3. Both: raise caps by the minimum needed, then trim where possible.

## Notes
Do not reduce agent functionality to fit caps. The caps exist to enforce token discipline,
not to artificially constrain agent capability. If the new content is load-bearing, raise the cap.

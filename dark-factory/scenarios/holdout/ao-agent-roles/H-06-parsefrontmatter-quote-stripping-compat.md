# Scenario: parseFrontmatter quote-stripping does not hide invalid quoted values

## Type
edge-case

## Priority
low — implementation risk is minimal since the spec mandates unquoted values, but a code-agent writing quoted values might accidentally pass tests

## Preconditions
- `parseFrontmatter()` in `dark-factory-setup.test.js` strips surrounding quotes from values
- An agent file has `model-role: "generator"` (with quotes) instead of `model-role: generator` (unquoted)

## Action
1. Set `spec-agent.md` frontmatter to include `model-role: "generator"` (quoted)
2. Run `parseFrontmatter()` on the file content
3. Assert the parsed value equals `"generator"` (quotes stripped)

Then verify:
1. The test assertion `assert.equal(fm['model-role'], 'generator')` passes (because the parser strips quotes)
2. The plugin mirror parity assertion (`assert.equal(source, plugin)`) still passes IF the plugin also has `model-role: "generator"` with the same quoting

## Expected Outcome
- Both quoted and unquoted forms pass the presence check and value-validity check in `dark-factory-setup.test.js`
- The mirror parity check passes only if source and plugin have the same quoting style (byte-exact comparison)
- The spec mandates unquoted — a code-agent that writes quoted values is technically functionally equivalent for test purposes

## Failure Mode (the gap this covers)
If the code-agent writes `model-role: "generator"` to source files but the plugin mirror is written as `model-role: generator` (or vice versa), the mirror parity test fails due to the quote difference. This scenario highlights that the only safe implementation is consistent unquoted style in both source and plugin files.

## Notes
EC-2 in the spec documents this behavior. The scenario is a holdout because understanding the quote-stripping behavior of `parseFrontmatter()` could lead a code-agent to use quoted values knowing the tests will still pass — but the mirror parity test would then catch any quoting inconsistency between source and plugin.

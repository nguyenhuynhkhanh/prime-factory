# Scenario: H-19 — Multiple ORMs present: deduplication by (file:line)

## Type
edge-case

## Priority
low — EC-10. Some projects use multiple ORMs for migration or for different databases.

## Preconditions
- Phase 3.7a is present.

## Action
Structural test asserts Phase 3.7a documents:
1. Multiple ORM/schema frameworks are scanned independently.
2. If two scanners produce candidates with the same `(file, line)` key (unlikely but possible in polyglot schemas), the duplicate is collapsed — only one candidate is produced.
3. If two scanners produce candidates with the same `title` but different `sourceRef`s (e.g., a "phone required" rule expressed in both Mongoose and Zod for the same entity), both are presented. The developer reviews them and may reject one, accept both, or merge them.

## Expected Outcome
- Multi-ORM scan is independent.
- Exact-duplicate collapse is documented.
- Title-similar-but-different-source candidates are BOTH presented.

## Failure Mode (if applicable)
If duplicate handling is not documented, test names the omission. If the documentation would merge title-similar candidates automatically, test fails — merging is a developer decision.

## Notes
The conservative principle: the agent never makes semantic equivalence judgments. Only the developer does, during sign-off.

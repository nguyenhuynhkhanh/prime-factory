# Scenario: df-intake leads and df-debug investigators reference code map

## Type
feature

## Priority
high -- leads and investigators are the primary consumers during spec/debug phases

## Preconditions
- df-intake SKILL.md and df-debug SKILL.md exist
- Code map feature has been implemented

## Action
Read the lead prompts in df-intake SKILL.md (Leads A, B, C) and investigator prompts in df-debug SKILL.md (Investigators A, B, C).

## Expected Outcome
- df-intake Lead A (User & Product) prompt mentions reading code-map.md for scope understanding
- df-intake Lead B (Architecture & Integration) prompt mentions reading code-map.md for dependency analysis and scope estimation
- df-intake Lead C (Reliability & Edge Cases) prompt mentions reading code-map.md for blast radius assessment
- df-debug Investigator A (Code Path Tracer) prompt mentions reading code-map.md Entry Points and Dependency Graph for call chain tracing
- df-debug Investigator B (History Detective) prompt mentions reading code-map.md for understanding affected module relationships
- df-debug Investigator C (Pattern & Systemic Analyst) prompt mentions reading code-map.md Hotspots for identifying high-risk shared modules
- All references include a conditional: "if it exists"

## Notes
Validates FR-11. Leads and investigators are spawned as independent agents, so the prompt must explicitly tell them to read the code map.

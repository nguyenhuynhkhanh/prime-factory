# Dark Factory — Shared Project Context

When working on a Dark Factory pipeline task, load project context before starting:

1. **Project profile**: Read `dark-factory/project-profile.md` if it exists. This contains the project's tech stack, architecture, conventions, and quality bar.
2. **Code map**: Read `dark-factory/code-map.md` if it exists. This contains the dependency graph, hotspots, and entry point traces.
3. **Manifest**: Read `dark-factory/manifest.json` to understand active features and their status.

If these files do not exist, proceed without them — the pipeline still works, but agents will have less context about the target project.

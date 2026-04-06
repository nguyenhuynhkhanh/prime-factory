# Scenario H-03: Layout does not pass session data as props to page.tsx

## Type
edge-case

## Priority
medium — App Router layout constraint. Violating this causes framework issues and breaks the data model.

## Preconditions
- A CTO user has a valid session cookie.
- `app/(dashboard)/layout.tsx` is implemented.

## Action
Inspect the layout component's return value. Check whether it passes any session-derived props (e.g., `orgId`, `userId`, `session`) to `{children}`.

## Expected Outcome
- The layout renders `{children}` directly without injecting any session props.
- `page.tsx` independently resolves its own session/data needs (either by calling `requireCtoSession` itself, or by calling the stats API which resolves session server-side).
- There is no TypeScript interface extending `children` to accept session props.

## Failure Mode
If the layout attempts to pass `orgId` or `session` via React Context, a custom wrapper component, or a `children` prop extension, this is a framework anti-pattern that will cause issues with layout caching and streaming.

## Notes
Per Next.js App Router docs: "Layouts cannot pass data to their children." The correct pattern is for each Server Component (page, nested layout) to independently call its own data-fetching helpers, using React `cache()` for deduplication if needed. The `requireCtoSession` helper itself handles deduplication via D1's session lookup.

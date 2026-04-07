# P-05: Dashboard navigation links are present

**Spec refs:** FR-5, FR-17  
**Track:** Track B

## Type
feature

## Priority
high

## Preconditions

- Admin is authenticated.
- Any dashboard page is rendered (the nav lives in the layout).

## Action

Render any page within `app/(dashboard)/` (e.g., the main `/` dashboard page or `/installs`).

## Expected Outcomes

**Navigation is rendered:**
- A `<nav>` element is present in the rendered HTML.
- The nav contains a link to `/` with visible text indicating "Dashboard" (or equivalent).
- The nav contains a link to `/installs` with visible text indicating "API Keys" (or equivalent).
- The nav contains a link to `/settings` with visible text indicating "Org Settings" (or equivalent).
- All links are implemented as Next.js `<Link>` components (renders as `<a>` tags in output).

**CopyInviteLink is gone:**
- The text "Copy invite link" does NOT appear anywhere on any dashboard page.
- The file `app/(dashboard)/installs/CopyInviteLink.tsx` is deleted or no longer imported.

## Notes

- The nav must NOT use an external navigation library — just `<nav>` + `<Link>` (FR-17).
- The layout still gates session access (existing behavior) — this scenario does not test the redirect path, only the nav rendering.
- Links must be `<Link>` from `next/link`, not plain `<a>` tags, to preserve SPA navigation behavior.

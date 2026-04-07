# P-02: Admin generates API key — modal shows key once

**Spec refs:** FR-6, FR-10, FR-11, FR-12, FR-13, FR-16, BR-4, EC-7  
**Track:** Track A

## Type
feature

## Priority
critical — this is the primary user action of the entire feature

## Preconditions

- Admin is authenticated (valid session cookie).
- The installs page is rendered and the "Generate API Key" button is visible.
- `POST /api/v1/installs` will return 201 with `{ id, apiKey, label, expiresAt }`.

## Action

1. Click "Generate API Key" button.
2. Modal opens with a label input and submit button.
3. Type a label value of 1–64 characters (e.g., `"alice-macbook-pro"`).
4. Click submit.

## Expected Outcome

**During submit (loading state):**
- Submit button is disabled.
- Loading indicator is visible (e.g., button text changes or spinner shown).
- Label input is disabled during the request.

**After 201 response:**
- The label input form is no longer shown.
- The modal now displays the `apiKey` value in a monospace element.
- The monospace element selects all text on click.
- Warning text is visible: "Copy this key now — you won't be able to see it again" (exact text or equivalent conveying single-reveal semantics).
- An "I've copied it" button (or equivalent confirmation label) is present.
- No X / close button is visible or reachable by keyboard that would dismiss the modal.

**After clicking "I've copied it":**
- The modal closes.
- The installs list reflects the new install (either via a page refresh triggered by `onSuccess` or via optimistic update).

## Boundary: label at max length (EC-7)

- Type exactly 64 characters into the label input.
- The input accepts all 64 characters.
- Submission proceeds normally.
- A 65th character cannot be entered (prevented by `maxLength={64}`).

## Failure Mode

If the modal is somehow closed before clicking "I've copied it", the admin has no way to retrieve the key from the UI. (This scenario validates that the implementation prevents this path — see H-01 for the adversarial variant.)

## Notes

- `orgId` is passed as a prop to `GenerateKeyModal` — the page must extract it from the session and pass it down.
- The `onSuccess(label)` callback fires after the admin clicks "I've copied it", not immediately after the 201 response.

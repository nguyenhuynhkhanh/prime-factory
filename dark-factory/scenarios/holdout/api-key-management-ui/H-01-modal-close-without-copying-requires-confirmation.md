# H-01: Modal close without copying requires confirmation — Escape and backdrop do not dismiss

**Spec refs:** FR-13, BR-4, EC-4, EC-5  
**Track:** Track A

## Type
edge-case

## Priority
critical — the one-time reveal is a security requirement; premature dismissal means the key is permanently lost

## Preconditions

- Admin is authenticated.
- The GenerateKeyModal is open and has successfully generated a key (201 response received).
- The modal is now showing the `apiKey` value and the "I've copied it" button.

## Scenario A: Escape Key

### Action
Press the Escape key.

### Expected Outcome
- The modal does NOT close.
- The `apiKey` value remains visible.
- The "I've copied it" button remains the only exit point.

## Scenario B: Backdrop Click

### Action
Click outside the modal (on the backdrop / overlay area).

### Expected Outcome
- The modal does NOT close.
- The `apiKey` value remains visible.

## Scenario C: No X Button

### Expected Outcome
- There is no X / close button rendered in the modal while the key-reveal state is active.
- (If an X button exists during the label-input phase, it must be absent or non-functional once the key is shown.)

## Scenario D: Parent Refresh While Modal Open (EC-4)

### Action
- Admin generates a key (201 response).
- The `onSuccess(label)` callback fires and causes the parent installs list to refresh (e.g., router.refresh() or re-fetch).
- While the parent is refreshing, the modal remains open showing the key.

### Expected Outcome
- The modal does NOT close during the parent refresh.
- The `apiKey` value remains visible until the admin clicks "I've copied it".
- After clicking "I've copied it", the modal closes normally.

## Notes

- The implementation should set `onEscapeKeyDown`, `onPointerDownOutside`, or equivalent event handlers to `(e) => e.preventDefault()` (or use a dialog component that supports `closeOnClickOutside={false}`).
- This scenario is holdout because the code-agent should implement the feature to satisfy BR-4 — we test here whether that constraint survives edge cases.



## Plan: Add "Log In" Button to Auth Page Header

**Change:** Add a button in the sticky header on the Auth page that scrolls down to the auth form section.

### Implementation

**File: `src/pages/Auth.tsx`**
- Add a `useRef` for the auth form `Card` element
- Add a "Log In" button (using the `Button` component, `outline` variant, `sm` size) to the right side of the header with `justify-between` layout
- On click, smooth-scroll to the auth form section using `ref.current.scrollIntoView({ behavior: 'smooth' })`
- Attach the ref to the auth form `Card`

Single file change, no backend modifications.




## Auth Flow Analysis & Fixes

Based on the session replay, console logs, and network requests, I found two issues:

### Issues Found

1. **Auth page doesn't redirect authenticated users.** After Google OAuth succeeds, the user lands back on `/auth` with a valid session but stays on the login page. The `Auth` component needs to check for an existing session and redirect to `/`.

2. **"Sign in was cancelled" error toast.** The session replay shows this toast appeared during Google sign-in. This is a known behavior when the OAuth popup/redirect is interrupted or when `lovable.auth.signInWithOAuth` returns an error object after redirect. The current error handling is correct but could suppress cancellation errors for better UX.

### Plan

**File: `src/pages/Auth.tsx`**
- Import and use `useAuth` hook to check for existing session
- Add a `useEffect` that redirects to `/` if `user` is already authenticated (handles the post-OAuth redirect case)
- Optionally filter out "cancelled" errors in `handleGoogleSignIn` to avoid confusing toast messages

### Technical Detail

```text
Auth.tsx changes:
1. import { useAuth } from "@/hooks/useAuth"
2. const { user, loading: authLoading } = useAuth();
3. useEffect(() => { if (user) navigate("/", { replace: true }); }, [user]);
4. Show loading spinner while authLoading
5. In handleGoogleSignIn, suppress cancel errors
```

No database or backend changes needed.


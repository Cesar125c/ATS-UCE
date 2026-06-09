# Frontend Changelog — Authentication Sprint

## Registration Flow

### `src/services/userService.ts`
- **Before**: Called old endpoint `POST /api/users/set-role` with only `clerkUserId` + `role`
- **After**: Calls `POST /api/v1/auth/register` with `clerk_user_id`, `first_name`, `last_name`, `email`, `role`
- **Dev mode**: Clerk `signUp.create()` is skipped — a local `clerk_user_id` is generated via `crypto.randomUUID()`. This avoids Clerk's strict validation (email uniqueness, required fields, network dependency) during development.
- **Error handling**: Parses FastAPI's `detail` array format (422) and string format (409) to show meaningful messages in the UI.

### `src/hooks/useSignUpWithRole.ts`
- **Before**: Only accepted `{ email, password, role }`
- **After**: Also accepts `firstName` and `lastName` and passes them through to `createUserWithRole`

### `src/components/home/RegisterForm.tsx`
- **Before**: Collected `firstName`/`lastName` in form but never passed them to `signUpUser`
- **After**: Passes `firstName` and `lastName` to `signUpUser()`
- **Fixed redirect**: Changed from `/administrator` to `/authorities` for the `authorities` role

## Routing & Navigation

### `src/App.tsx`
- **Before**:
  - `getRoleRedirect` mapped `authorities` → `/administrator`
  - Route `/administrator` rendered `Administrator` component
- **After**:
  - `getRoleRedirect` maps `authorities` → `/authorities`
  - Route `/authorities` renders `Authorities` component
  - Removed all `/administrator` references

### `src/pages/Administrator.tsx` → `src/pages/Authorities.tsx`
- Renamed file and component from `Administrator` to `Authorities`
- Component now matches the role string `authorities` used by backend

## Configuration

### `vite.config.ts`
- **Before**: No `server.proxy` — API calls to `/api/*` hit Vite dev server instead of backend
- **After**: Added proxy rule forwarding `/api` → `http://localhost:8000` with `changeOrigin: true`
  ```ts
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  }
  ```

## Environment

### `frontend/.env`
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key for development instance

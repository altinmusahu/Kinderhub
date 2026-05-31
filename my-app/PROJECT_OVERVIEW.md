# Project Overview

## Summary

This repository is a Next.js application built with the App Router (`app/`) and a server-side API layer. It is structured as a backend-focused starter project with tenant-aware authentication, Supabase integration, and modular service/repository patterns for entities like users, departments, locations, subscription plans, and work tracking.

The app includes a simple authentication flow, tenant scoping, and server-side API routes designed around Next.js `app/api` route handlers.

## Primary Technologies

- Next.js 16.2.6 (App Router)
- React 19.2.4
- TypeScript
- Tailwind CSS v4
- Supabase JavaScript client (`@supabase/supabase-js` and `@supabase/ssr`)
- Supabase Admin client for server-side user management
- `bcryptjs` for password hashing
- `jsonwebtoken`-style JWT support via Web Crypto API custom implementation
- `zod` for request validation
- `pg` types, likely for PostgreSQL compatibility with Supabase
- `@vercel/analytics` for analytics support
- UI libraries: `lucide-react`, `class-variance-authority`, `clsx`, `radix-ui`, `tailwind-merge`, `tw-animate-css`
- 3D rendering support with `three`, `@react-three/fiber`, and `@react-three/drei`

## Application Structure

### Root files

- `package.json` - dependencies and basic scripts
- `next.config.ts` - default Next.js configuration placeholder
- `app/layout.tsx` - root layout using `next/font/google` for Geist fonts and global metadata
- `app/page.tsx` - likely main landing page content (not inspected in full)
- `app/globals.css` - global styling and Tailwind setup

### Pages and routes

- `app/login/page.tsx` - login page
- `app/signup/page.tsx` - signup page
- `app/subscribe/page.tsx` and `SubscribeForm.tsx` - subscription onboarding or plan selection page
- `app/dashboard/...` - authenticated dashboard area with sub-pages for billing, classes, documents, families, messages, staff, users

### API routes

The project uses Next.js route handlers under `app/api`.

Key routes:
- `app/api/auth/login/route.ts` - login and JWT cookie issuance
- `app/api/auth/signup/route.ts` - user registration
- `app/api/auth/logout/route.ts` - clears auth cookie
- `app/api/users/route.ts` - GET list and POST create
- `app/api/users/[id]/route.ts` - likely GET/PUT/DELETE for individual users
- `app/api/users/[id]/change-password/route.ts` - password change route
- `app/api/departments/route.ts` - department list/create
- `app/api/departments/[id]/route.ts` - department detail route
- `app/api/locations`, `subscription_plans`, `tenant_subscriptions`, `tenants`, `work_tracking` - similarly structured domain APIs

### Modular services and repositories

The backend follows a separation of concerns with:

- `app/api/modules/*/*.service.ts` - business logic layer
- `app/api/modules/*/*.repository.ts` - direct Supabase DB access
- `app/api/modules/*/*.validation.ts` - Zod schemas for request validation
- `app/api/modules/*/*.types.ts` - type definitions for entity shape

This pattern appears for modules such as users, departments, locations, subscription plans, tenant subscriptions, and work tracking.

## Authentication and Authorization

### JWT and session handling

- Custom JWT signing and verification exists in `lib/auth.ts`
- Tokens are signed using HMAC-SHA256 via the Web Crypto API and stored in a cookie named `auth_token`
- Tokens include:
  - `sub` (user id)
  - `email`
  - `tenant_id`
  - `role`
  - `exp` expiration timestamp
- The cookie is set with `httpOnly`, `sameSite: lax`, `secure` in production, and a path of `/`

### Tenant extraction

- `lib/get-tenant.ts` reads the cookie from Next.js `cookies()` and verifies the token
- If verification fails, the request is rejected with `Unauthorized`
- This makes tenant-aware API requests possible without an external session store

## Supabase Integration

- `lib/supabase-admin.ts` exports a server-side Supabase admin client using:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- This client bypasses RLS and is intended only for server-side routes

### Auth user creation and management

- `UserService` uses `supabaseAdmin.auth.admin.createUser` to create Supabase auth users
- On signup and internal user creation, the project stores credentials in a Supabase `users` table and also registers the user in Supabase Auth
- Password changes trigger both DB updates and Supabase Auth updates
- Deletion removes the user from the DB and Supabase Auth

## Data Model Patterns

### Users

User service and repository reveal fields like:
- `id`
- `name`
- `lastname`
- `email`
- `password_hash`
- `phone_number`
- `personal_number`
- `date_of_birth`
- `role`
- `is_active`
- `tenant_id`
- `is_first_login_executed`
- `created_at`

The service hides `password_hash` before returning user objects to clients.

### Departments, locations, subscriptions, work tracking

The repository design is similar across domains and likely uses Supabase tables named after the module.
- `DepartmentService.getAll(tenantId)`
- `DepartmentService.create(...)`
- The exact entity fields are defined in corresponding `*.types.ts` files.

## Technical Behavior and Flow

### Signup flow

1. Client POSTs signup payload to `app/api/auth/signup/route.ts`
2. Request body validated by Zod
3. `UserService.findByEmail()` ensures no duplicate email
4. `UserService.createFromSignup()` hashes password and creates a Supabase auth user
5. A record is inserted into the `users` table with a fixed tenant ID
6. Response returns created user metadata

### Add Staff flow

1. The staff page uses `components/ui/AddStaffModal.tsx` to open a shared modal form
2. The modal fetches departments from `GET /api/departments` and displays `id`/`name` for the dropdown
3. On submit, the modal sends the new user payload including `department_id` and `position_name` to `POST /api/users`
4. The backend creates the Supabase auth user, inserts a `users` row, and also creates a `work_tracking` record for the new staff member

### Login flow

1. Client POSTs credentials to `app/api/auth/login/route.ts`
2. Credentials validated by `loginSchema`
3. `UserRepository.findByEmail()` retrieves user record
4. Password is verified with `bcrypt.compare`
5. JWT is signed and set as a cookie
6. User data is returned to the client

### Protected API requests

- Routes call `getTenant()` to verify auth cookie and extract `tenant_id`
- Operations are scoped to that tenant using `.eq("tenant_id", tenantId)` in Supabase queries
- Unauthorized access returns `401`

## UI and Pages

The UI folder structure suggests a mix of landing content and authenticated dashboard experience.

- `components/landing/` holds marketing and hero sections
- `components/dashboard/` includes sidebar, data tables, and modal components
- `components/LanguageSwitcher.tsx` suggests multi-language UI support
- `app/dashboard/` pages show dashboard sections like billing, classes, documents, families, messages, staff, users
- `subscribe/SubscribeForm.tsx` indicates a subscription signup flow or plan chooser
- `components/ui/` contains shared UI primitives and a reusable dialog/modal implementation
- `components/ui/index.ts` provides a shared export surface for common UI components
- `components/ui/AddStaffModal.tsx` provides a reusable Add Staff modal with department selection

## Shared UI and Modal Architecture

- `components/ui/dialog.tsx` is a reusable Radix Dialog wrapper with consistent button, overlay, and content styling.
- `components/ui/AddStaffModal.tsx` is a client-side modal form used by the staff page to create new users via `POST /api/users`.
- `components/ui/ViewUserModal.tsx` is a reusable row-level modal shell that can render details without data fetching built in.
- `lib/utils.ts` exports `cn()` for consistent Tailwind class merging across UI components.

## Theoretical Purpose

This project appears to be a SaaS-style multi-tenant backend with a first-party admin/user dashboard. The architecture is intended for:

- tenant-scoped data access
- managed users with roles
- structured business entities like departments, locations, subscription plans, and work tracking
- server-side authentication using cookies and JWTs
- Supabase as database and auth provider

## Notes and Observations

- There is a hard-coded tenant ID (`8c0785e5-83cc-4fa3-9957-75ae61b50d37`) in `UserService` and possibly elsewhere, which indicates a prototype or initial tenant bootstrap pattern.
- The `app/api/modules` folder is the central place for backend domain logic.
- Some routes are not inspected directly, but the naming conventions strongly imply REST-style handlers for CRUD operations.
- The project structure is aligned with modern Next.js App Router best practices: route handlers, server-only libs, and a clear separation between UI pages and API logic.

## How to Run

From the project root:

```bash
npm install
npm run dev
```

Then open http://localhost:3000

Environment variables likely required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` (optional, falls back to a development fallback)

## Suggested Improvements

- Remove hard-coded tenant IDs and replace them with dynamic tenant creation or tenant assignment logic.
- Add proper error payload structure in API routes for consistent client-side handling.
- Ensure `JWT_SECRET` is configured in production and avoid fallback defaults.
- Expand welcome README with project-specific running instructions and environment requirements.

---

This file was generated from the current workspace files available in `my-app/`. It reflects observed code patterns, architecture, and behavior from the Next.js App Router API and Supabase-backed user management system.
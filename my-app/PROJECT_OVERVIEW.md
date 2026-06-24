# Project Overview — Kinderhub CRM

## Summary

Kinderhub is a multi-tenant CRM dashboard for childcare management built with Next.js App Router, React 19, TypeScript, and Supabase. It features a custom design system (Kinderhub Design System, `kh-*` classes), JWT-based authentication, Supabase Storage for documents, and a modular service/repository architecture for backend logic.

---

## Primary Technologies

- **Next.js** (App Router, server components, route handlers)
- **React 19.2.4** with `useTransition`, `useEffect`, `useState`
- **TypeScript** throughout
- **Tailwind CSS v4** + custom CSS design system (`globals.css`)
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`)
  - Admin client for server-side CRUD (bypasses RLS)
  - Supabase Auth for user accounts
  - Supabase Storage (private `documents` bucket, signed URLs)
- **bcryptjs** for password hashing
- **Custom JWT** via Web Crypto API (HMAC-SHA256, no external JWT lib)
- **Zod** for API request validation
- **next/font/google**: Geist, Geist Mono, Instrument Serif, JetBrains Mono
- `lucide-react`, `class-variance-authority`, `clsx`, `radix-ui`, `tailwind-merge`

---

## Application Structure

```
my-app/
├── app/
│   ├── layout.tsx                        Root layout (fonts, metadata)
│   ├── globals.css                       Design system tokens + component classes
│   ├── dashboard/
│   │   ├── layout.tsx                    Sidebar + main shell
│   │   ├── page.tsx                      Dashboard overview (stats, rooms, activity)
│   │   ├── staff/
│   │   │   ├── page.tsx                  Staff directory (server, fetches DB)
│   │   │   └── [id]/
│   │   │       ├── page.tsx              Employee detail hero (server)
│   │   │       ├── EmployeeTabs.tsx      Tab switcher (client)
│   │   │       └── components/
│   │   │           ├── types.ts          Shared types (ClassRow, DocRow, WorkTrackingRow, UserById)
│   │   │           ├── Field.tsx         Field + SaveBar form primitives
│   │   │           ├── PersonalCard.tsx  Editable personal info card
│   │   │           ├── AccountCard.tsx   Read-only account details card
│   │   │           ├── EmploymentCard.tsx Editable role/status + History button
│   │   │           ├── WorkHistoryModal.tsx Side drawer timeline + add position form
│   │   │           ├── ScheduleTab.tsx   Weekly schedule view (lazy-loaded)
│   │   │           └── DocumentsTab.tsx  Document upload/view/delete (lazy-loaded)
│   │   ├── families/page.tsx             Family list with status/balance (client, mock data)
│   │   ├── classes/page.tsx              Class cards with enrollment/staff (client, mock data)
│   │   ├── billing/page.tsx              Invoices + revenue chart (client, mock data)
│   │   ├── messages/page.tsx             3-pane messaging UI (client, mock data)
│   │   ├── documents/page.tsx            Org-wide documents table (client, mock data)
│   │   ├── calendar/page.tsx             Week-view calendar (server, mock data)
│   │   └── settings/page.tsx             Departments, team members, roles (server, mock data)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts            POST login → JWT cookie
│   │   │   ├── signup/route.ts           POST signup → creates user
│   │   │   └── logout/route.ts           POST clears cookie
│   │   ├── users/
│   │   │   ├── route.ts                  GET all users / POST create user
│   │   │   └── [id]/
│   │   │       ├── route.ts              GET / PATCH / DELETE single user
│   │   │       ├── classes/route.ts      GET classes (lead or assistant)
│   │   │       ├── documents/route.ts    GET / POST / DELETE documents (Supabase Storage)
│   │   │       ├── work-tracking/route.ts GET all / POST new position (closes current)
│   │   │       └── change-password/route.ts POST change password
│   │   ├── departments/route.ts          GET / POST departments
│   │   ├── departments/[id]/route.ts     GET / PUT / DELETE department
│   │   ├── locations/route.ts            GET / POST locations
│   │   ├── families/route.ts             GET / POST families
│   │   ├── parents/route.ts              POST parent/guardian
│   │   ├── kids/route.ts                 POST child record
│   │   ├── classes/route.ts              GET / POST classes
│   │   ├── work_tracking/route.ts        GET / POST (module-level)
│   │   ├── tenants/route.ts              Tenant CRUD
│   │   ├── subscription_plans/route.ts   Plan management
│   │   └── tenant_subscriptions/route.ts Subscription management
│   ├── modules/                          Backend domain logic
│   │   ├── user/{service,repository,types,validation}.ts
│   │   ├── departments/{service,repository,types,validation}.ts
│   │   ├── locations/{service,repository,types,validation}.ts
│   │   ├── work_tracking/{service,repository,types,validation}.ts
│   │   ├── subscription_plans/...
│   │   └── tenant_subscriptions/...
│   └── components/
│       └── dashboard/
│           ├── Sidebar.tsx               Navigation sidebar with ArchMark logo
│           ├── DataTable.tsx             Generic typed table component
│           └── FirstLoginModal.tsx       First-login prompt
├── components/
│   └── ui/
│       ├── Modal.tsx                     Base modal + MField/MSection/MInput/MSelect/MBtn/MGrid/MToggle
│       ├── DepartmentSelect.tsx          useDepartments hook + DepartmentSelect + DepartmentSelectPlain
│       ├── AddStaffModal.tsx             3-section staff creation modal
│       ├── AddFamilyModal.tsx            4-step family wizard modal
│       ├── AddClassModal.tsx             Class creation modal
│       ├── ConfirmModal.tsx              Reusable destructive confirm dialog
│       ├── helper.tsx                    avatarColor(), initials()
│       ├── ViewUserModal.tsx             Row-level user detail shell
│       └── (shadcn base) button, input, select, table, badge, dialog
├── lib/
│   ├── auth.ts                           signToken(), verifyToken(), cookieName(), cookieOptions()
│   ├── get-tenant.ts                     getTenant() — reads + verifies JWT from cookie
│   ├── supabase-admin.ts                 supabaseAdmin client (service role)
│   ├── db.ts                             getUsers() / addUser() shortcuts (hardcoded tenant)
│   └── utils.ts                          cn() Tailwind merge
└── public/                               Static assets
```

---

## Design System

### Fonts (loaded in `app/layout.tsx`, CSS vars in `globals.css`)
| Font | Variable | Use |
|------|----------|-----|
| Geist | `--kh-font-sans` | Body text |
| JetBrains Mono | `--kh-font-mono` | Data, IDs, timestamps |
| Instrument Serif | `--kh-font-serif` | Headings (`kh-h1`), stat values |

### Color Tokens
| Token | Value | Use |
|-------|-------|-----|
| `--kh-bg` | `#F5F5F5` | Page background |
| `--kh-surface` | `#FFFFFF` | Cards, panels |
| `--kh-peach` | `#D2592F` | Primary accent, buttons, active states |
| `--kh-peach-d` | `#B24420` | Hover/dark peach |
| `--kh-marigold` | `#F3B43C` | Warning/secondary accent |
| `--kh-sage` | `#7FA06A` | Success/active green |
| `--kh-pink` | `#E48F8F` | Soft accent |
| `--kh-sky` | `#8FB7C9` | Info accent |
| `--kh-border` | `#E8E4DD` | Default borders |
| `--kh-ink-900` | `#1A1714` | Primary text |
| `--kh-ink-400` | `#A09890` | Muted/label text |

### Key Component Classes
- **Layout**: `kh-app`, `kh-sidebar`, `kh-main`, `kh-page`, `kh-topbar`, `kh-content`
- **Cards**: `kh-card`, `kh-card-header`, `kh-card-title`
- **Navigation**: `kh-nav-item`, `kh-nav-item--active`, `kh-nav-badge`
- **Buttons**: `kh-btn`, `kh-btn--primary`
- **Typography**: `kh-h1`, `kh-sub`
- **Tables**: `kh-table`, `kh-table-row--selected`
- **Status**: `kh-status-badge`, `kh-pill-dot`
- **Tabs**: `kh-tab`, `kh-tab--active`, `kh-tab-count`
- **Stats**: `kh-stats-grid`, `kh-stat-card`, `kh-stat-value`, `kh-stat-label`
- **Avatar**: `kh-avatar` (28px circle, deterministic color via `avatarColor()`)
- **Room bars**: `kh-room-bar`, `kh-room-bar-fill`
- **Breadcrumb**: `kh-breadcrumb`, `kh-breadcrumb-parent`, `kh-breadcrumb-current`

### Logo / Brand Mark
`ArchMarkSVG` component in `Sidebar.tsx` — custom SVG archway with rising sun using brand colors (peach portal, sky window, marigold sun, sage/pink dots). Wordmark "kinder*hub*" with serif italic *hub* in peach.

---

## Authentication & Authorization

- **Custom JWT**: HMAC-SHA256 signed via Web Crypto API in `lib/auth.ts`
- **Cookie name**: `auth_token`, `httpOnly`, `sameSite: lax`, `secure` in production
- **Payload**: `{ sub, email, tenant_id, role, exp }` (8-hour TTL)
- **Tenant extraction**: `getTenant()` reads cookie in every API route handler
- **All protected routes**: Call `getTenant()` first, scope all DB queries by `tenant_id`
- **Unauthorized**: Returns HTTP 401

---

## API Architecture

### Pattern (all protected routes)
```typescript
export async function GET/POST/PATCH/DELETE(req, { params }) {
  const { tenant_id } = await getTenant()  // auth check
  // ... business logic via Service or direct supabaseAdmin
  return NextResponse.json(data)
}
```

### Service / Repository / Validation / Types modules
Located under `app/api/modules/{entity}/`:
- `{entity}.repository.ts` — Supabase queries (raw DB access)
- `{entity}.service.ts` — Business logic layer
- `{entity}.validation.ts` — Zod schemas
- `{entity}.types.ts` — TypeScript interfaces

Entities: `user`, `departments`, `locations`, `work_tracking`, `subscription_plans`, `tenant_subscriptions`

---

## Key Data Models

### User (`user.types.ts`)
```typescript
User: {
  id, name, lastname, email, password_hash,
  phone_number, personal_number, date_of_birth,
  role, is_active, tenant_id,
  is_first_login_executed, created_at
}

UserById: {
  user: Omit<User, "password_hash">
  position_name: string | null
  tenant_name: string | null
  department_name: string | null      // joined from departments via work_tracking
  responsible_user_id: string | null
  responsible_user_name: null         // intentionally null (no FK constraint)
  start_date: string | null
}
```

### WorkTrackingRow (components/types.ts)
```typescript
{
  id, position_name, start_date, end_date,
  department_id, responsible_user_id,
  department: { name } | null         // joined from departments table
}
```

### DocRow (components/types.ts)
```typescript
{
  id, file_url,        // signed URL (7-day TTL)
  storage_path,        // stored path in Supabase Storage (not URL)
  created_at
}
```

### ClassRow (components/types.ts)
```typescript
{
  id, name, average_year,
  starts_at, ends_at,    // "HH:MM:SS+00" format
  capacity,
  locations: { name } | null
}
```

---

## Employee Detail Page (recently refactored)

The `/dashboard/staff/[id]` route is the most feature-rich page and was heavily refactored into a component-split architecture.

### Server Layer (`page.tsx`)
- Fetches `UserService.getById(id, tenant_id)`
- Returns `notFound()` if user missing or error
- Renders full-page hero with avatar, status badge, name, position, contact info
- Passes `user` and `userId` to client `<EmployeeTabs>`

### `user.repository.ts` — `findById` key logic
- Selects `work_tracking` joined with `departments`
- Picks active record JS-side: `find(wt => wt.end_date === null) ?? [0] ?? null`
- **Never filters joined rows in Supabase** (would null-out parent row if no match)

### Client Tab Components
| Component | Data source | Edit |
|-----------|-------------|------|
| `PersonalCard` | `user.user.*` | PATCH `/api/users/[id]` |
| `AccountCard` | `user.user.*` | No (read-only) |
| `EmploymentCard` | `user.*` (work tracking fields) | PATCH `/api/users/[id]` (role + is_active) |
| `ScheduleTab` | GET `/api/users/[id]/classes` | No |
| `DocumentsTab` | GET `/api/users/[id]/documents` | POST / DELETE |
| `WorkHistoryModal` | GET/POST `/api/users/[id]/work-tracking` | POST (add new position) |

### Supabase Storage (Documents)
- **Bucket**: `documents` (private)
- **Upload path**: `{userId}/{timestamp}_{filename}`
- **DB stores**: Storage path (not URL) in `file_url` column
- **Read**: Batch `createSignedUrls()` with 7-day TTL on every GET
- **`toStoragePath()`**: Backward-compat helper extracts path from old full URLs

### Work Tracking Create (POST `/api/users/[id]/work-tracking`)
1. Verifies user belongs to tenant
2. Sets `end_date = today` on any record where `end_date IS NULL` (closes current)
3. Inserts new record with `end_date = null` (becomes new current)
4. Returns new row with department join

### `fileName()` helper (DocumentsTab)
```typescript
function fileName(url: string) {
  const withoutQuery = url.split("?")[0]   // strip ?token=...
  const raw = withoutQuery.split("/").pop() ?? ""
  return raw.replace(/^\d+_/, "")          // strip timestamp prefix
}
```

---

## Shared UI Components

### `Modal.tsx` — Base modal + form primitives
- Backdrop click + ESC key to close
- Exports: `Modal`, `MField`, `MSection`, `MInput`, `MSelect`, `MToggle`, `MSegmented`, `MGrid`, `MBtn`

### `DepartmentSelect.tsx`
- `useDepartments()` — fetches `/api/departments`, cached in state
- `DepartmentSelect` — wraps `MSelect`, for use inside Modal forms
- `DepartmentSelectPlain` — plain `<select>`, for use outside Modal (e.g., WorkHistoryModal)

### `AddStaffModal.tsx`
- 3 sections: Personal details, Role & placement, Access (send invite toggle)
- Uses `DepartmentSelect` (Modal variant)
- Removed local `departments` state — uses shared `useDepartments` hook via `DepartmentSelect`
- POST `/api/users`

### `AddFamilyModal.tsx`
- 4-step wizard: Family → Guardians → Children → Review
- Step rail on left with progress indicators
- POST `/api/families` → POST `/api/parents` (×n) → POST `/api/kids` (×n)

### `AddClassModal.tsx`
- Day picker, time fields, staff/location selects
- POST `/api/classes`

### `ConfirmModal.tsx`
- Reusable destructive confirm dialog

### `DataTable.tsx`
- Generic `<T>` typed table
- Props: `columns`, `rows`, `getRowKey`, `getRowClassName`, `title`, `meta`
- Column shape: `{ key, header, headerStyle, cell, cellStyle }`

---

## Pages Summary

| Page | Route | Data | Real DB |
|------|-------|------|---------|
| Overview | `/dashboard` | Mock | No |
| Staff | `/dashboard/staff` | Live (UserService) | Yes |
| Employee Detail | `/dashboard/staff/[id]` | Live (UserService + APIs) | Yes |
| Families | `/dashboard/families` | Mock | No |
| Classes | `/dashboard/classes` | Mock | No |
| Billing | `/dashboard/billing` | Mock | No |
| Messages | `/dashboard/messages` | Mock | No |
| Documents | `/dashboard/documents` | Mock | No |
| Calendar | `/dashboard/calendar` | Mock | No |
| Settings | `/dashboard/settings` | Mock | No |

---

## Known Issues / Technical Notes

1. **Hardcoded tenant ID** in `lib/db.ts` (`8c0785e5-83cc-4fa3-9957-75ae61b50d37`) — prototype bootstrap pattern, not production-ready
2. **`responsible_user_name` always null** — `work_tracking.responsible_user_id` has no FK constraint to `users`, so PostgREST join is impossible without schema change
3. **No mobile breakpoints** — UI is desktop-first, no responsive layout defined
4. **Mock data on most pages** — only Staff + Employee Detail pages use live Supabase data
5. **Supabase PostgREST join filter limitation** — filtering on joined table rows in `.select()` acts as an inner join and can null the parent; workarounds use JS-side filtering post-fetch

---

## How to Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

### Required environment variables
```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
```

### Supabase Storage
- Bucket name: `documents`
- Endpoint: `https://zhlehpihbfcpwfbhmyqm.storage.supabase.co/storage/v1/s3`
- Region: `eu-west-1`
- Bucket must be **private** — access via signed URLs only

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
│   │   │   ├── page.tsx                  Staff directory (server, live DB, avatar colors, department)
│   │   │   └── [id]/
│   │   │       ├── page.tsx              Employee detail hero (server)
│   │   │       ├── EmployeeTabs.tsx      Tab switcher (client, thin orchestrator)
│   │   │       └── components/
│   │   │           ├── types.ts          Shared types (ClassRow, DocRow, WorkTrackingRow, UserById)
│   │   │           ├── Field.tsx         Field + SaveBar form primitives
│   │   │           ├── PersonalCard.tsx  Editable personal info card
│   │   │           ├── AccountCard.tsx   Read-only account details card
│   │   │           ├── EmploymentCard.tsx Editable role/status + History button
│   │   │           ├── WorkHistoryModal.tsx Side drawer timeline + add position form
│   │   │           ├── ScheduleTab.tsx   Weekly schedule view (lazy-loaded)
│   │   │           └── DocumentsTab.tsx  Document upload/view/delete (lazy-loaded)
│   │   ├── families/
│   │   │   ├── page.tsx                  Family list (server, live DB, clickable rows)
│   │   │   └── [id]/
│   │   │       ├── page.tsx              Family detail hero (server)
│   │   │       └── FamilyTabs.tsx        Tab switcher + Overview/Documents (client)
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
│   │   │       ├── work-tracking/route.ts GET all / POST new position (closes current open)
│   │   │       └── change-password/route.ts POST change password
│   │   ├── departments/route.ts          GET / POST departments
│   │   ├── departments/[id]/route.ts     GET / PUT / DELETE department
│   │   ├── locations/route.ts            GET / POST locations
│   │   ├── families/route.ts             GET / POST families (tenant_id injected from JWT)
│   │   ├── parents/route.ts              POST parent/guardian (tenant_id injected from JWT)
│   │   ├── kids/route.ts                 POST child record (tenant_id injected from JWT)
│   │   ├── classes/route.ts              GET / POST classes
│   │   ├── work_tracking/route.ts        GET / POST (module-level)
│   │   ├── tenants/route.ts              Tenant CRUD
│   │   ├── subscription_plans/route.ts   Plan management
│   │   └── tenant_subscriptions/route.ts Subscription management
│   └── api/modules/                      Backend domain logic
│       ├── user/{service,repository,types,validation}.ts
│       ├── departments/{service,repository,types,validation}.ts
│       ├── locations/{service,repository,types,validation}.ts
│       ├── work_tracking/{service,repository,types,validation}.ts
│       ├── families/{service,repository,types,validation}.ts
│       ├── parents/{service,repository,types,validation}.ts
│       ├── kids/{service,repository,types,validation}.ts
│       ├── subscription_plans/...
│       └── tenant_subscriptions/...
│   └── components/
│       └── dashboard/
│           ├── Sidebar.tsx               Navigation sidebar with ArchMark logo
│           ├── DataTable.tsx             Generic typed table component
│           └── FirstLoginModal.tsx       First-login prompt
├── components/
│   └── ui/
│       ├── Modal.tsx                     Base modal + MField/MSection/MInput/MSelect/MBtn/MGrid/MToggle
│       ├── DepartmentSelect.tsx          useDepartments hook + DepartmentSelect + DepartmentSelectPlain
│       ├── AddStaffModal.tsx             3-section staff creation modal (uses DepartmentSelect)
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
- **`tenant_id` injection**: Client forms never know the tenant — all POST routes extract it from the JWT server-side via `getTenant()` and inject it into every DB insert

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

Entities: `user`, `departments`, `locations`, `work_tracking`, `families`, `parents`, `kids`, `subscription_plans`, `tenant_subscriptions`

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

UserWithWorkTrackingAndDepartment: {
  id, name, lastname, email, role, is_active, created_at,
  phone_number, personal_number, date_of_birth,
  position_name: string | null
  department_name: string | null
}
```

### Families (`families/families.types.ts`)
```typescript
Families: { id, name, status, plan, balance, tenant_id, created_at }

FamilyWithDetails: {
  id, name, status, plan, balance, created_at,
  primary_contact: string | null    // firstname + lastname of first parent
  kids_count: number
}

FamilyParent: {
  id, firstname, lastname, phone_number, address,
  pick_up: boolean, is_active: boolean,
  date_of_birth, personal_number
}

FamilyKid: {
  id, firstname, lastname, date_of_birth,
  gender, personal_number: string | null, class_id: string | null
}

FamilyDetail: {
  id, name, status, plan, balance, created_at,
  parents: FamilyParent[],
  kids: FamilyKid[]
}
```

### Parents (`parents/parents.types.ts`)
```typescript
Parents: {
  id, family_id, firstname, lastname, date_of_birth,
  personal_number, is_active: boolean, phone_number,
  address, pick_up: boolean, tenant_id, created_at
}
CreateParentsDto: { family_id, firstname, lastname, date_of_birth, personal_number, is_active, phone_number, address, pick_up, tenant_id }
```

### WorkTrackingRow (staff components/types.ts)
```typescript
{
  id, position_name, start_date, end_date,
  department_id, responsible_user_id,
  department: { name } | null         // joined from departments table
}
```

### DocRow (staff components/types.ts)
```typescript
{
  id, file_url,        // signed URL (7-day TTL)
  storage_path,        // stored path in Supabase Storage (not URL)
  created_at
}
```

### ClassRow (staff components/types.ts)
```typescript
{
  id, name, average_year,
  starts_at, ends_at,    // "HH:MM:SS+00" format
  capacity,
  locations: { name } | null
}
```

---

## Employee Detail Page (`/dashboard/staff/[id]`)

The most feature-rich page — component-split architecture.

### Server Layer (`page.tsx`)
- Fetches `UserService.getById(id, tenant_id)`
- Returns `notFound()` if user missing or error
- Renders full-page hero with avatar, status badge, name, position, contact info
- Passes `user` and `userId` to client `<EmployeeTabs>`

### `user.repository.ts` — `findById` key logic
- Selects `work_tracking` joined with `departments`, including `end_date`
- Picks active record JS-side: `find(wt => wt.end_date === null) ?? [0] ?? null`
- Guards `Array.isArray(wt?.department)` for PostgREST join cardinality variance
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

---

## Family Detail Page (`/dashboard/families/[id]`)

Mirrors the employee detail page architecture.

### Server Layer (`page.tsx`)
- Fetches `FamiliesService.getByIdWithDetails(id, tenant_id)` → `FamilyDetail`
- Returns `notFound()` if missing
- Renders hero: family avatar initials, status badge, plan subtitle, primary contact + phone
- Quick stats panel: Children count, Parents count, Balance (red if > 0)
- Passes `family` to client `<FamilyTabs>`

### `families.repository.ts` — `findByIdWithDetails`
```typescript
.select(`
  id, name, status, plan, balance, created_at,
  parents ( id, firstname, lastname, phone_number, address, pick_up, is_active, date_of_birth, personal_number ),
  kids    ( id, firstname, lastname, date_of_birth, gender, personal_number, class_id )
`)
.eq("id", id).eq("tenant_id", tenantId).maybeSingle()
```
Guards `Array.isArray()` on both `parents` and `kids` joins.

### `FamilyTabs.tsx` Client Tabs
| Card | Content |
|------|---------|
| `ChildrenCard` | Gender emoji, name, age, DOB, personal number |
| `ParentsCard` | Primary badge, pickup/active status badges, address/DOB/personal number grid |
| `BillingCard` | Plan, balance due (red if > 0), since date, status |
| Documents | Placeholder — coming soon |

---

## Staff Directory (`/dashboard/staff`)

- Server component using `FamiliesService` pattern: `UserService.getAllWithWorkTrackingAndDepartment(tenant_id)`
- Shows avatar (deterministic color via `avatarColor(id)`), name+email, department, role, status badge
- `findAllWithWorkTrackingAndDepartment` fixed: selects `end_date`, picks active work_tracking record JS-side, guards `Array.isArray()` for department join

---

## Families Directory (`/dashboard/families`)

- Server component using `FamiliesService.getAllWithDetails(tenant_id)`
- Shows family avatar + name (as `Link` to detail page), status badge, plan, kids count, balance (red if > 0), since date
- `AddFamilyModal` triggers 4-step wizard

---

## Shared UI Components

### `Modal.tsx` — Base modal + form primitives
- Backdrop click + ESC key to close
- Exports: `Modal`, `MField`, `MSection`, `MInput`, `MSelect`, `MToggle`, `MSegmented`, `MGrid`, `MBtn`

### `DepartmentSelect.tsx`
- `useDepartments()` — fetches `/api/departments` on mount, cached in state
- `DepartmentSelect` — wraps `MSelect`, for use inside Modal forms
- `DepartmentSelectPlain` — plain `<select>` styled inline, for use outside Modal (WorkHistoryModal)

### `AddStaffModal.tsx`
- 3 sections: Personal details, Role & placement, Access (send invite toggle)
- Uses `DepartmentSelect` (Modal variant) — removed local `departments` state/useEffect

### `AddFamilyModal.tsx`
- 4-step wizard: Family → Guardians → Children → Review
- Step rail on left with progress indicators
- `Guardian` type uses `pick_up: boolean` (not `is_active`) for pickup authorization toggle
- POST `/api/families` → POST `/api/parents` (×n) → POST `/api/kids` (×n)
- All POSTs inject `tenant_id` server-side from JWT

### `DataTable.tsx`
- Generic `<T>` typed server component
- Props: `columns`, `rows`, `getRowKey`, `getRowClassName`, `title`, `meta`
- Column shape: `{ key, header, headerStyle, cell, cellStyle }`
- **Note**: functions (cell renderers, `getRowHref`) cannot be passed from server → client across the RSC boundary; clickable rows are achieved by wrapping cell content in `<Link>` instead

---

## Pages Summary

| Page | Route | Data | Real DB |
|------|-------|------|---------|
| Overview | `/dashboard` | Mock | No |
| Staff | `/dashboard/staff` | Live (UserService) | Yes |
| Employee Detail | `/dashboard/staff/[id]` | Live (UserService + APIs) | Yes |
| Families | `/dashboard/families` | Live (FamiliesService) | Yes |
| Family Detail | `/dashboard/families/[id]` | Live (FamiliesService) | Yes |
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
4. **Mock data on most pages** — Staff, Employee Detail, Families, Family Detail use live Supabase data; all other pages still use mock data
5. **Supabase PostgREST join filter limitation** — filtering on joined table rows in `.select()` acts as an inner join and can null the parent; workarounds use JS-side filtering post-fetch
6. **RSC boundary constraint** — `DataTable` is a server component; functions (cell renderers, click handlers) cannot be serialized across the server→client boundary. Clickable rows use `<Link>` inside cell renderers instead of `onClick` props.

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

# Project Overview — Kinderhub CRM

## Summary

Kinderhub is a multi-tenant CRM dashboard for childcare management built with Next.js App Router, React 19, TypeScript, and Supabase. It features a custom design system (Kinderhub Design System, `kh-*` classes), JWT-based authentication, Supabase Storage for documents (private bucket) and staff profile pictures (public bucket), a modular service/repository architecture for backend logic, a collapsible sidebar + activity panel, an org-wide document center with a unified upload modal, branded Excel exports for Families, Staff, and per-class Attendance, a fire-and-forget activity logging system wired into every mutating API route, a class detail page with ten tabs covering roster, scheduling, daily check-in/check-out attendance, incidents, a first-day checklist with per-kid progress tracking, and a parent-facing class hub (posts/rules/events), and a Staff module with per-currency salary history, editable personal address, and click-to-upload profile pictures.

---

## Primary Technologies

- **Next.js 16.2.6** (App Router, server components, route handlers, Turbopack)
- **React 19.2.4** with `useTransition`, `useEffect`, `useState`
- **TypeScript** throughout
- **Tailwind CSS v4** + custom CSS design system (`globals.css`)
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`)
  - Admin client for server-side CRUD (bypasses RLS)
  - Supabase Auth for user accounts
  - Supabase Storage (private `documents` bucket via signed URLs; public `profiles` bucket via direct public URLs)
- **bcryptjs** for password hashing
- **Custom JWT** via Web Crypto API (HMAC-SHA256, no external JWT lib)
- **Zod** for API request validation
- **ExcelJS** for branded `.xlsx` exports (Families, Staff)
- **next/font/google**: Geist, Geist Mono, Instrument Serif, JetBrains Mono
- `lucide-react`, `class-variance-authority`, `clsx`, `radix-ui`, `tailwind-merge`

---

## Application Structure

```
app/
├── layout.tsx                        Root layout (fonts, metadata, JSON-LD SEO)
├── globals.css                       Design system tokens + component classes
├── faq/page.tsx                      Public FAQ page (accordion, JSON-LD SEO, plan limits)
├── subscribe/
│   ├── page.tsx                      Public subscribe page — fetches plan via SubscriptionPlanService, renders SubscribeForm
│   └── SubscribeForm.tsx             2-step wizard: create tenant → confirm subscription (client)
├── dashboard/
│   ├── layout.tsx                    Async layout — fetches activity items, renders DashboardShell
│   ├── page.tsx                      Dashboard overview (stats, rooms, activity)
│   ├── staff/
│   │   ├── page.tsx                  Staff directory (server, live DB, avatar photo-or-initials, department) — single joined query includes `user_profiles` so no N+1 per row
│   │   └── [id]/
│   │       ├── page.tsx              Employee detail hero (server) — fetches active salary + profile picture alongside the user record
│   │       ├── EmployeeTabs.tsx      Tab switcher (client, thin orchestrator)
│   │       └── components/
│   │           ├── types.ts          Shared types (ClassRow, DocRow, WorkTrackingRow, SalaryRow, UserById)
│   │           ├── Field.tsx         Field + SaveBar form primitives
│   │           ├── PersonalCard.tsx  Editable personal info card (also shows read-only formatted Address)
│   │           ├── AccountCard.tsx   Read-only account details card
│   │           ├── EmploymentCard.tsx Editable role/status + History button
│   │           ├── WorkHistoryModal.tsx Side drawer timeline + add position form
│   │           ├── ScheduleTab.tsx   Weekly schedule grid (lazy-loaded, shows opens/closes per day)
│   │           ├── SalaryTab.tsx     Salary history — add form includes a currency `<select>` sourced from `/api/currency`; amounts render with each record's own currency symbol
│   │           ├── SalaryCard.tsx    Read-only current-salary summary (Overview tab), shows amount + symbol
│   │           ├── ProfileAvatar.tsx Click-to-upload profile picture — always-visible camera badge (not hover-only), hover-darken + spinner while uploading, POSTs to `/api/users/[id]/profile-picture`
│   │           └── DocumentsTab.tsx  Document upload/view/delete (lazy-loaded); accepts `userId` OR `familyId` + `title` — reused by FamilyTabs
│   ├── families/
│   │   ├── page.tsx                  Family list (server, live DB, clickable rows, ExportFamiliesButton)
│   │   └── [id]/
│   │       ├── page.tsx              Family detail hero (server)
│   │       ├── FamilyTabs.tsx        Tab switcher: Overview, Parents, Billing, Documents, Activity (client) — Documents tab reuses staff `DocumentsTab` with `familyId`; Activity tab shows waitlist→enrollment transfers for this family's kids
│   │       ├── AddParentButton.tsx   Opens AddParentModal; accepts familyId prop
│   │       ├── AddParentModal.tsx    Creates parent via POST /api/parents; calls router.refresh()
│   │       ├── EditParentButton.tsx  Pencil icon per parent row; opens EditParentModal
│   │       ├── EditParentModal.tsx   Pre-populated edit form; PATCHes /api/parents/[id]; calls router.refresh()
│   │       ├── AddKidButton.tsx      "+ Add kid" trigger on the Overview tab's Children card; opens AddKidModal
│   │       └── AddKidModal.tsx       Add-child form (name, DOB, personal number, Gender select) — POSTs /api/kids with family_id + optional class_id
│   ├── classes/
│   │   ├── page.tsx                  Class cards grid (server, live DB via ClassesService, live enrolled/waitlist counts per card)
│   │   └── [id]/
│   │       ├── page.tsx              Class detail — hero, capacity ring, tabs (live DB)
│   │       ├── ClassTabs.tsx         Tab orchestrator: Roster, Schedule, Attendance, Incidents, Curriculum, Checklist, Progress, Hub, Documents — tab strip has left/right nav arrows on screens ≤1023px
│   │       ├── AddChildButton.tsx    Trigger button for AddChildModal
│   │       ├── AddChildModal.tsx     Multi-select child picker — assigns multiple kids to class in parallel
│   │       ├── WaitlistTable.tsx     Waitlist card — kid search picker (via GET /api/waitlist/[class_id]), add/remove entries
│   │       ├── TakeAttendanceButton.tsx  Client trigger on the class hero topbar — opens TakeAttendanceModal, router.refresh() on close
│   │       ├── TakeAttendanceModal.tsx   Per-kid check-in/check-out/absent modal for today; inline toast + live-refresh event on every save
│   │       ├── AttendanceTab.tsx     Attendance log — stats, search/date-range/staff/status filters, paginated table; listens for the same live-refresh event
│   │       ├── ExportAttendanceButton.tsx Downloads GET /api/classes/[id]/attendance/export as .xlsx, carrying the tab's current filters
│   │       ├── IncidentsTab.tsx      Incident log for the class roster — report modal + list, delete restricted to the reporter
│   │       ├── ChecklistTab.tsx      First-day checklist builder (categorized items) + "Needs attention" panel (incomplete kids only)
│   │       ├── ProgressTab.tsx       Per-kid cards with every checklist item as a toggleable checkbox — full picture, complete or not
│   │       └── HubTab.tsx            Class board — composer + post feed (edit/delete own posts), pinned rules, upcoming events
│   ├── billing/page.tsx              Invoices + revenue chart (client, mock data)
│   ├── messages/page.tsx             3-pane messaging UI (client, mock data)
│   ├── documents/page.tsx            Org-wide documents table (server, live DB via DocumentsService, UploadDocumentModal)
│   ├── calendar/page.tsx             Week-view calendar (server, mock data)
│   ├── food-menus/
│   │   ├── layout.tsx                Breadcrumb + Supplies/Menus underline tab strip (client)
│   │   ├── page.tsx                  Redirects to /dashboard/food-menus/supplies
│   │   ├── supplies/
│   │   │   ├── page.tsx              Food supplies / receipts log (server, live DB via FoodSuppliesService)
│   │   │   ├── SuppliesClient.tsx    KPI strip, callout banner, DataTable of receipts; camera icon opens ReceiptViewer when a photo exists
│   │   │   ├── ExportSuppliesButton.tsx Downloads GET /api/food-supplies/export as .xlsx
│   │   │   ├── UploadReceiptModal.tsx Add/scan a receipt — compact optional photo strip up top (never a big empty box), full-width vendor/date/location fields + editable line-items grid below; scans automatically on file pick via Claude vision, but photo is fully optional and manual entry gets full room either way
│   │   │   └── ReceiptViewer.tsx     Read-only photo + line-items popup for a saved supply
│   │   └── menus/
│   │       └── page.tsx              Class menus weekly schedule (client) — class-picker segmented buttons, 5×3 (weekday × meal) grid, click-to-edit cells saved via PUT on blur, Print week button
│   └── settings/
│       ├── layout.tsx                Settings shell — vertical sidebar nav (desktop) / scrollable chip strip (mobile)
│       ├── general/page.tsx          Legal entity info (editable, PUT /api/tenant-legal-info) + read-only subscription card
│       ├── currency/page.tsx         Currency CRUD — list, add/edit (CurrencyModal with searchable world-currency picker), delete (DeleteConfirm)
│       ├── locations/page.tsx        Locations CRUD — list, add, edit (LocationModal), delete (DeleteConfirm)
│       ├── billing-plan/page.tsx     Current plan hero + progress bar + stat cards + upgrade via mailto
│       ├── data-privacy/page.tsx     GDPR compliance info, data retention, legal docs, CSV export, erasure request
│       └── team/page.tsx             Departments + staff table (real DB) + roles list + permission matrix
├── api/
│   ├── auth/
│   │   ├── login/route.ts            POST login → JWT cookie
│   │   ├── signup/route.ts           POST signup → creates user
│   │   ├── logout/route.ts           POST clears cookie
│   │   └── me/route.ts               GET current session subset ({ sub, email, tenant_id, role }) — used by client components to check "is this mine"
│   ├── users/
│   │   ├── route.ts                  GET all users / POST create user
│   │   ├── with-department/route.ts  GET users with work-tracking + department info
│   │   ├── export/route.ts           GET — streams branded .xlsx of all staff (ExcelJS) + logActivity("exported")
│   │   └── [id]/
│   │       ├── route.ts              GET / PATCH / DELETE single user
│   │       ├── classes/route.ts      GET classes (lead or assistant)
│   │       ├── documents/route.ts    GET / POST / DELETE documents (Supabase Storage)
│   │       ├── work-tracking/route.ts GET all / POST new position (closes current open) + logActivity
│   │       ├── salary/route.ts       GET history / POST new record (closes current active, requires currency_id) / DELETE record
│   │       ├── profile-picture/route.ts GET current picture / POST upload (replaces existing) / DELETE — public `profiles` bucket
│   │       └── change-password/route.ts POST change password
│   ├── departments/route.ts          GET / POST departments + logActivity
│   ├── departments/[id]/route.ts     GET / PUT / DELETE department + logActivity
│   ├── currency/route.ts             GET / POST tenant currencies (no logActivity — unlike most other mutating routes)
│   ├── currency/[id]/route.ts        PATCH / DELETE single currency (no logActivity)
│   ├── locations/route.ts            GET / POST locations + logActivity
│   ├── locations/[id]/route.ts       PATCH / DELETE single location + logActivity
│   ├── families/route.ts             GET / POST families + logActivity
│   ├── families/export/route.ts      GET — streams branded .xlsx of all families (ExcelJS) + logActivity("exported")
│   ├── families/[id]/documents/route.ts GET / POST / DELETE family-scoped documents (Supabase Storage, mirrors users/[id]/documents)
│   ├── families/[id]/waitlist-transfers/route.ts GET — kids in this family whose live class_id no longer matches the class they're still waitlisted for (computed on read, no persisted log)
│   ├── documents/route.ts            GET all documents for tenant (joined subject name/type across families/staff/kids) / POST upload (multi-target: family_id | user_id | kid_id) + logActivity
│   ├── parents/route.ts              POST parent/guardian + logActivity
│   ├── parents/[id]/route.ts         PATCH update parent + logActivity; DELETE parent
│   ├── kids/
│   │   ├── route.ts                  GET (unassigned kids only) / POST child record
│   │   ├── [class_id]/route.ts       GET kids by class
│   │   ├── [class_id]/kids/[kid_id]/route.ts  PUT — assign kid to class (sets class_id)
│   │   └── [class_id]/kids/[kid_id]/parents/route.ts GET the kid's family's parents (for attendance check-out "released to" picker) — class_id in the URL is unused, kept only to satisfy Next's same-level dynamic-segment naming rule alongside the sibling PUT route
│   ├── classes/
│   │   ├── route.ts                  GET / POST classes + logActivity
│   │   ├── [id]/route.ts             PATCH / DELETE single class
│   │   ├── with-enrollment/route.ts  GET classes with live enrolled count (joins kids table)
│   │   └── [id]/
│   │       ├── checklist/route.ts             GET items for class / POST new item
│   │       ├── checklist/[itemId]/route.ts    PATCH / DELETE single checklist item
│   │       ├── checklist/progress/route.ts    GET per-kid done/of/missing rollup (mandatory items only) / PUT upsert one kid+item checked state
│   │       ├── checklist/progress/detail/route.ts GET every item × every enrolled kid with checked state (backs the Progress tab)
│   │       ├── hub/posts/route.ts             GET class feed / POST new post (author = session user)
│   │       ├── hub/posts/[postId]/route.ts    PATCH / DELETE — only the original author (403 otherwise)
│   │       ├── hub/rules/route.ts             GET / POST pinned rule
│   │       ├── hub/rules/[ruleId]/route.ts    DELETE rule
│   │       ├── hub/events/route.ts            GET / POST class event
│   │       ├── hub/events/[eventId]/route.ts  DELETE event
│   │       ├── incidents/route.ts             GET incidents for class roster / POST new incident (reported_by = session user)
│   │       ├── incidents/[incidentId]/route.ts DELETE — only the original reporter (403 otherwise)
│   │       ├── attendance/route.ts             GET filtered/paginated attendance log ({ rows, total, stats }) — dateFrom/dateTo/search/checkedOutBy/releasedTo/status/page/pageSize
│   │       ├── attendance/[date]/route.ts      GET roster merged with that date's rows (pending kids synthesized) / PUT upsert one kid's check-in, check-out, or absent action
│   │       └── attendance/export/route.ts      GET — streams branded .xlsx honoring the same filters as the log route + logActivity("exported")
│   │       └── menus/route.ts        GET a week's grid (5 weekdays × 3 meal types, empty cells synthesized) / PUT upsert one cell
│   ├── classes/light/route.ts        GET lightweight { id, name }[] class list (no tenant filter, matches rest of classes module) — powers the Menus tab's class picker
│   ├── food-supplies/
│   │   ├── route.ts                  GET list for tenant / POST multipart upload (file optional, items JSON field) + logActivity
│   │   ├── [id]/route.ts             GET single (with items) / DELETE (removes items, row, then storage object if present)
│   │   ├── export/route.ts           GET — streams branded .xlsx of all receipts (ExcelJS) + logActivity("exported")
│   │   └── parse/route.ts            POST — multipart single file, returns Claude-vision-parsed { vendor_name, purchase_date, items[], total_cost }; requires a file (nothing to scan without one), independent of the save route's optional-file rule
│   ├── waitlist/
│   │   ├── [class_id]/route.ts       GET entries (also used as the kid-picker source for WaitlistTable) / POST add kid to waitlist (kid_id FK)
│   │   └── entry/[id]/route.ts       DELETE waitlist entry
│   ├── search/route.ts               GET global search — families/classes/kids by name (tenant-scoped, min 2-char query)
│   ├── activities/route.ts           GET activities (tenant-scoped, latest 50)
│   ├── work_tracking/route.ts        GET / POST (module-level)
│   ├── tenants/route.ts              Tenant CRUD
│   ├── tenant-legal-info/route.ts    GET legal info (or null) / PUT upsert (create or update)
│   ├── subscription_plans/
│   │   ├── route.ts                  GET all plans
│   │   └── [id]/route.ts             GET single plan
│   └── tenant_subscriptions/route.ts GET current subscription with plan join / POST create
└── api/modules/                      Backend domain logic
    ├── user/{service,repository,types,validation}.ts
    ├── departments/{service,repository,types,validation}.ts
    ├── locations/{service,repository,types,validation}.ts
    ├── work_tracking/{service,repository,types,validation}.ts
    ├── families/{service,repository,types,validation}.ts
    ├── parents/{service,repository,types,validation}.ts
    ├── kids/{service,repository,types,validation}.ts
    ├── classes/{service,repository,types,validation}.ts
    ├── waitlist/{service,repository,types}.ts                 findClassTransfersForFamily() powers the Family Activity tab
    ├── activities/{service,repository,types}.ts
    ├── documents/{service,repository,types,validation}.ts    Org-wide document center (family/staff/child scoped)
    ├── class_checklist_items/{service,repository,types,validation}.ts   Class-scoped first-day checklist items (category, mandatory, applies_to)
    ├── family_checklist_progress/{service,repository,types}.ts          Per-kid checked state; getProgressForClass() (rollup) + getDetailedProgressForClass() (full item list, backs Progress tab)
    ├── class_hub_posts/{service,repository,types,validation}.ts         Class board posts — author-scoped update/delete
    ├── class_rules/{service,repository,types,validation}.ts             Pinned class rules
    ├── class_events/{service,repository,types,validation}.ts            Upcoming class events
    ├── incidents/{service,repository,types,validation}.ts               Kid-scoped incident log — reporter-scoped delete
    ├── kid_attendance/{service,repository,types,validation}.ts          Daily check-in/check-out/absent log; getForClassAndDate() merges roster with rows (synthesizes "pending" for unmarked kids)
    ├── tenant_legal_info/{service,repository,types,validation}.ts
    ├── subscription_plans/{service,repository,types,validation}.ts
    ├── tenant_subscriptions/{service,repository,types}.ts
    ├── search/{service,repository,types}.ts                  Global search across families/classes/kids (no validation.ts — plain query string, no Zod)
    ├── currency/{service,repository,types,validation}.ts     Tenant-scoped currency list (currency code + symbol); backs both Settings → Currency and the salary currency picker
    ├── address/{service,repository,types,validation}.ts      One address per user (street/house_number/city/postal_code/country); created alongside the user, no dedicated PATCH endpoint yet (read-only after creation)
    ├── user_profiles/{service,repository,types,validation}.ts Profile pictures — one row per user, replaces (deletes old row + old storage object) on re-upload; public `profiles` bucket, no signed URLs needed
    ├── salary_tracking/{service,repository,types,validation}.ts  Per-user salary history with FK to `currency`; creating a record closes the previously active one
    ├── food_supplies/{service,repository,types,validation}.ts  Receipts + line items; file upload optional (`receipt_storage_path` nullable end-to-end), private `receipt` bucket, signed URLs (7-day TTL)
    ├── food_supplies/food_supplies.parser.ts                   parseReceiptImage() — Claude vision (structured JSON output) turns a receipt photo into { vendor_name, purchase_date, items[], total_cost }; best-effort, never blocks manual entry on failure
    └── class_menus/{service,repository,types,validation}.ts   Weekly menu grid; upsert-by-natural-key (class_id, date, meal_type) via find-then-branch, same pattern as kid_attendance/family_checklist_progress

app/components/
└── dashboard/
    ├── DashboardShell.tsx            Client component — owns sidebar + activity panel collapse state + mobile nav state
    │                                 State initialized from localStorage in useEffect; suppresses
    │                                 hydration mismatch with suppressHydrationWarning + opacity fade
    │                                 Wraps children in MobileNavContext.Provider; manages body scroll lock on mobile
    ├── Sidebar.tsx                   Collapsible nav sidebar (52px icon-only); on mobile slides in as off-canvas drawer
    │                                 Accepts mobileOpen + onMobileClose props; shows X close button when mobile open
    ├── MobileNavContext.tsx          React context exposing openMobileNav(); used by any page topbar
    ├── MobileMenuButton.tsx          Hamburger button (kh-hamburger class); calls openMobileNav() via context
    ├── ActivityFeed.tsx              fetchActivityItems() async server function
    ├── ActivityPanel.tsx             Client component — collapsible right activity panel
    ├── DataTable.tsx                 Generic typed table component; table wrapped in kh-table-scroll for horizontal scroll
    ├── FirstLoginModal.tsx           First-login prompt
    ├── ExportFamiliesButton.tsx      Client — downloads GET /api/families/export as .xlsx (Blob + anchor click)
    └── ExportStaffButton.tsx         Client — downloads GET /api/users/export as .xlsx (Blob + anchor click)

app/components/landing/
    └── PricingSection.tsx            Fetches DB plans; uses getPlanByCode() from lib/plans.ts for features/descriptions

components/
└── ui/
    ├── Modal.tsx                     Base modal + MField/MSection/MInput/MSelect/MBtn/MGrid/MToggle
    ├── DepartmentSelect.tsx          useDepartments hook + DepartmentSelect + DepartmentSelectPlain
    ├── AddStaffModal.tsx             3-section staff creation modal (uses DepartmentSelect)
    ├── AddFamilyModal.tsx            5-step family wizard: Family → Guardians → Children → Class → Review
    │                                 Step 4 fetches /api/classes/with-enrollment, shows capacity bar,
    │                                 auto-checks waitlist when class is full, optional manual override
    ├── AddClassModal.tsx             Class creation modal — per-day schedule builder, start/end date pickers
    │                                 with +3mo/+6mo/+1yr quick-pick buttons
    ├── ConfirmModal.tsx              Reusable destructive confirm dialog
    ├── UploadDocumentModal.tsx       Org-wide document upload — segmented Family/Staff/Child target picker, POSTs to /api/documents
    ├── helper.tsx                    avatarColor(), initials()
    ├── ViewUserModal.tsx             Row-level user detail shell
    └── (shadcn base) button, input, select, table, badge, dialog

lib/
├── auth.ts                           signToken(), verifyToken(), cookieName(), cookieOptions()
├── get-tenant.ts                     getTenant() — reads + verifies JWT from cookie
├── log-activity.ts                   logActivity() — fire-and-forget activity logger
├── plans.ts                          PLANS[] single source of truth — Starter/Growth/Enterprise features, prices, descriptions
│                                     Exports getPlanByCode(code) and getPlanByName(name)
├── supabase-admin.ts                 supabaseAdmin client (service role)
├── db.ts                             getUsers() / addUser() shortcuts (hardcoded tenant)
├── excel-export.ts                   exportToExcelBuffer() — branded ExcelJS workbook builder (title row, header fill, striped rows, footer count) used by Families/Staff/Attendance export routes
├── attendance-events.ts              notifyAttendanceUpdated()/onAttendanceUpdated() — window CustomEvent bus scoped by classId so TakeAttendanceModal can live-refresh AttendanceTab without a page reload
├── anthropic.ts                      Anthropic SDK client (ANTHROPIC_API_KEY) — used by food_supplies.parser.ts for receipt-photo OCR
└── utils.ts                          cn() Tailwind merge

public/                               Static assets (including 06-banner-hero.webp)
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
| `--kh-peach-l` | `#E8866A` | Light peach |
| `--kh-peach-bg` | `#FAF0EB` | Peach tint background (pills, hero gradients) |
| `--kh-marigold` | `#F3B43C` | Warning/secondary accent |
| `--kh-marigold-bg` | `#FDF6E3` | Marigold tint background |
| `--kh-sage` | `#7FA06A` | Success/active green |
| `--kh-sage-d` | `#5E7E4C` | Dark sage |
| `--kh-sage-bg` | `#EDF5EA` | Sage tint background (status pills) |
| `--kh-pink` | `#E48F8F` | Soft accent / allergy alerts |
| `--kh-pink-d` | `#C06060` | Dark pink |
| `--kh-pink-bg` | `#FAEAEA` | Pink tint background |
| `--kh-sky` | `#8FB7C9` | Info accent |
| `--kh-border` | `#E8E4DD` | Default borders |
| `--kh-ink-900` | `#1A1714` | Primary text |
| `--kh-ink-400` | `#9E968A` | Muted/label text |
| `--kh-shadow-sm` | — | Card default shadow |
| `--kh-shadow-md` | — | Card hover/elevated shadow |

### Key Component Classes
- **Layout**: `kh-app`, `kh-sidebar`, `kh-sidebar--collapsed`, `kh-sidebar--mobile-open`, `kh-main`, `kh-page`, `kh-topbar`, `kh-topbar-right`, `kh-content`
- **Cards**: `kh-card`, `kh-card-header`, `kh-card-title`, `kh-class-card` (hover lift)
- **Navigation**: `kh-nav-item`, `kh-nav-item--active`, `kh-nav-item--icon-only`, `kh-nav-badge`, `kh-nav-badge-dot`
- **Buttons**: `kh-btn`, `kh-btn--primary`
- **Typography**: `kh-h1`, `kh-sub`
- **Tables**: `kh-table`, `kh-table-row--selected`, `kh-table-scroll` (horizontal overflow wrapper)
- **Status**: `kh-status-badge`, `kh-pill-dot`
- **Tabs**: `kh-tab`, `kh-tab--active`, `kh-tab-count`, `kh-tabs-scroll` (scrollable tab strip on mobile), `kh-tabs-nav-arrow` / `kh-tabs-nav-arrow--visible` (ClassTabs left/right nav arrows, ≤1023px only), `kh-tab-split-grid` (main+sidebar split, stacks ≤1023px), `kh-progress-grid` (Progress tab per-kid cards, auto-fill minmax 320px)
- **Stats**: `kh-stats-grid`, `kh-stat-card`, `kh-stat-value`, `kh-stat-label`, `kh-kpi-strip` (4-col → 2-col responsive)
- **Avatar**: `kh-avatar` (28px, deterministic color via `avatarColor()`)
- **Room bars**: `kh-room-bar`, `kh-room-bar-fill`
- **Breadcrumb**: `kh-breadcrumb`, `kh-breadcrumb-parent`, `kh-breadcrumb-sep`, `kh-breadcrumb-current`
- **Sidebar toggle**: `kh-sidebar-toggle`
- **Activity panel**: `kh-activity-panel`, `kh-activity-panel--collapsed`, `kh-activity-panel-header`, `kh-activity-feed`
- **Mobile**: `kh-hamburger` (menu button), `kh-sidebar-overlay` (tap-to-close backdrop), `kh-roster-row` (flex → column on tablet)
- **Forms**: `kh-field-grid` (2-col on desktop, 1-col on mobile), `kh-classes-grid` (auto-fill minmax 280px)

### Logo / Brand Mark
`ArchMarkSVG` component in `Sidebar.tsx` — custom SVG archway with rising sun using brand colors (peach portal, sky window, marigold sun, sage/pink dots). Wordmark "kinder*hub*" with serif italic *hub*.

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
  const session = await getTenant()   // auth check — returns full payload
  // ... business logic via Service or direct supabaseAdmin
  await logActivity(session, "created", "Staff", name)  // fire-and-forget
  return NextResponse.json(data)
}
```

### Service / Repository / Validation / Types modules
Located under `app/api/modules/{entity}/`:
- `{entity}.repository.ts` — Supabase queries (raw DB access)
- `{entity}.service.ts` — Business logic layer
- `{entity}.validation.ts` — Zod schemas
- `{entity}.types.ts` — TypeScript interfaces

Entities: `user`, `departments`, `locations`, `work_tracking`, `families`, `parents`, `kids`, `classes`, `waitlist`, `activities`, `documents`, `class_checklist_items`, `family_checklist_progress`, `class_hub_posts`, `class_rules`, `class_events`, `incidents`, `kid_attendance`, `tenant_legal_info`, `subscription_plans`, `tenant_subscriptions`, `salary_tracking`, `search`, `currency`, `address`, `user_profiles`

---

## Activity Logging System

### `lib/log-activity.ts`
Fire-and-forget helper called at the end of every POST/PATCH route.
```typescript
logActivity(session, action, entity, entityName?)
// → "Class "Sunbeam" was created by Altin Musahu on 25/06/2026"
// Never throws — silent catch ensures it never blocks the response
```

`ActivityAction` union includes `"created"`, `"updated"`, `"deleted"`, `"generated"`, `"exported"` (added for Excel export routes).
`ActivityEntity` union includes: `"Staff"`, `"Family"`, `"Class"`, `"Department"`, `"Location"`, `"Document"`, `"Legal info"`, and others.

### `app/api/activities/route.ts`
GET endpoint returning the 50 most recent activities for the authenticated tenant.

### `app/components/dashboard/ActivityFeed.tsx`
`fetchActivityItems()` — async server function (not a component) called from the dashboard layout. Returns `{ items, error }` so errors surface in the UI instead of being swallowed.

### `app/components/dashboard/ActivityPanel.tsx`
Client component rendering the right-hand activity sidebar. Collapsible to 52px (icon-only). Shows activity list with colored dots keyed by entity type.

### `app/components/dashboard/DashboardShell.tsx`
Client wrapper owning both `sidebarCollapsed` and `activityCollapsed` boolean states. Reads localStorage in `useEffect` (server renders default uncollapsed state to avoid SSR mismatch). Uses `suppressHydrationWarning` on the shell div and an `opacity` fade on `kh-main` to hide the layout jump before localStorage is read. Writes back to localStorage on every toggle.

---

## Collapsible Sidebars

Both sidebars collapse to **52px** icon-only mode:
- **Left sidebar** (`Sidebar.tsx`): hides ArchMark SVG, wordmark, nav labels, section headers, badges; shows only icons and toggle button; badge dot indicator replaces full badge count
- **Right activity panel** (`ActivityPanel.tsx`): hides title, activity list; shows only toggle button and a dot indicator when activities exist
- Collapse state persisted in `localStorage` keys `kh-sidebar-collapsed` and `kh-activity-collapsed`
- Transitions on `width` with `overflow: hidden` on sidebar elements
- **Hydration**: Server always renders uncollapsed; client reads localStorage in `useEffect` then fades in — no hydration error

### Mobile Navigation (≤767px)

- Sidebar uses `transform: translateX(-100%)` off-canvas approach — slides in smoothly on open
- `kh-sidebar--mobile-open` class applies `transform: translateX(0)` to reveal it
- `kh-sidebar-overlay` semi-transparent backdrop renders behind the open sidebar; tap closes it
- `DashboardShell` manages `mobileOpen` state, locks `document.body` scroll when open, adds a resize listener to auto-close on desktop resize
- `MobileNavContext` threads `openMobileNav()` to any page topbar without prop drilling
- `MobileMenuButton` (hamburger) is placed inside each page's own topbar breadcrumb row
- Activity panel is `display: none` on mobile/tablet — main content takes full width
- **Tablet (768–1023px)**: sidebar collapses to 52px; activity panel hidden
- Settings page: vertical sidebar nav becomes a horizontal scrollable chip strip (`#kh-settings-mobile-nav`)

---

## Key Data Models

### Classes (`classes/classes.types.ts`)
```typescript
Class: {
  id, name, average_year,
  capacity: number,
  starts_at: string | null,   // DATE — "YYYY-MM-DD"
  ends_at: string | null,     // DATE — "YYYY-MM-DD"
  schedule: Record<string, { opens: string; closes: string }> | null,
  lead_user_id: string,
  assistant_user_id: string | null,
  location_id: string,
}

ClassWithRelations: Class & {
  location_name: string | null
  lead_name: string | null
  assistant_name: string | null
  enrolled_count: number   // live count from kids.class_id
  waitlist_count: number   // live count from waitlists.class_id
}
```
> `findAll()` and `findById()` fetch enrolled/waitlist counts in parallel alongside the class query (`Promise.all`) — no more hardcoded `0 / capacity` placeholder on the classes grid.

### Waitlist (`waitlist/waitlist.types.ts`)
```typescript
WaitlistEntry: {
  id, kid_id, class_id, created_at, tenant_id,
  // joined from kids table:
  firstname?: string
  lastname?: string
  date_of_birth?: string
}

CreateWaitlistDto: { kid_id, class_id, tenant_id }

// A waitlist row whose kid has since been enrolled in a different class
// than the one they're still waitlisted for.
ClassTransferEvent: {
  waitlist_id, kid_id, kid_name,
  waitlisted_class_id, waitlisted_class_name,
  current_class_id, current_class_name,
  waitlisted_at
}
```
> The `waitlists` table has FK `kid_id → kids(id)` — no standalone name/dob columns.
> `WaitlistRepository.findClassTransfersForFamily(tenantId, familyId)` joins `waitlists` → `kids` (filtered to the family) and compares each row's `class_id` against the kid's live `class_id`; a mismatch means the kid was waitlisted for one class but has since been enrolled in another. Computed on every read — nothing is persisted, so there's no cleanup needed when a kid transfers again. Surfaced in the Family detail page's Activity tab via `GET /api/families/[id]/waitlist-transfers`.

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
  department_name: string | null
  responsible_user_id: string | null
  responsible_user_name: null
  start_date: string | null
  salary: SalaryTracking | null      // active record, joined with currency.symbol
  address: Address | null            // one row per user, joined
}

UserWithWorkTrackingAndDepartment: {
  id, name, lastname, email, is_active, created_at,
  department_id: string | null
  department_name: string | null
  position_name: string | null
  profile_picture_url: string | null // computed via getPublicUrl() in the same query — no extra DB round trip
}
```

### Currency (`currency/currency.types.ts`)
```typescript
Currency: { id, tenant_id, currency: string, symbol: string }
```
> Tenant-scoped list of currencies (e.g. `EUR` / `€`), managed at Settings → Currency via a searchable picker (`app/dashboard/settings/currency/world-currencies.ts` — static ISO 4217 list of ~155 currencies used only to populate the *code + symbol* fields when creating a tenant currency; the `currency` table itself only ever stores what the tenant has explicitly added). Referenced by `salary_tracking.currency_id`.

### Salary Tracking (`salary_tracking/salary_tracking.types.ts`)
```typescript
SalaryTracking: {
  id, user_id, date, salary: number, is_active: boolean,
  currency_id: string,
  symbol: string       // not a real column — joined from `currency.symbol` on every read
}
```
> One active record per user at a time — `SalaryTrackingService.create()` closes the previously active row (`is_active = false`) before inserting the new one. All three repository read paths (`findByUser`, `findActiveByUser`, and the `create` insert's `.select()`) join `currency(symbol)` so the amount can always be rendered with its correct symbol without a second query — this was a real bug fixed mid-project: the `create()` insert originally only did a plain `.select()` with no join, so a freshly-added salary record showed no currency symbol until the page was refreshed.

### Address (`address/address.types.ts`)
```typescript
Address: { id, user_id: string | null, street, house_number, city, postal_code, country, created_at }
```
> One row per user, created alongside the user record (`UserService.create()` calls `AddressService.create()` after the user + work_tracking rows are inserted). Surfaced read-only on the staff Personal Information card as a single formatted line; no PATCH endpoint exists yet, so editing an existing address isn't wired up.

### User Profiles / Profile Pictures (`user_profiles/user_profiles.types.ts`)
```typescript
UserProfile: { id, user_id, file_url, created_at }   // file_url is a storage path, not a URL
```
> Public `profiles` Supabase Storage bucket (unlike `documents`, which is private + signed-URL only) — `UserProfilesRepository.getPublicUrl()` builds the URL directly with no network call, so it's cheap to compute per-row even across an entire staff list. `UserProfilesService.upload()` validates type (jpeg/png/webp/gif) and size (≤5MB), then replaces any existing picture: deletes the old DB row and the old storage object after the new one succeeds. The staff list query (`findAllWithWorkTrackingAndDepartment`) embeds `user_profiles(file_url, created_at)` in its single existing `select()` alongside `work_tracking` — deliberately avoided a per-row fetch (N+1) for profile pictures.

### Search (`search/search.types.ts`)
```typescript
SearchResults: { families: SearchFamilyResult[], classes: SearchClassResult[], kids: SearchKidResult[] }
SearchFamilyResult: { id, name, status }
SearchClassResult: { id, name }
SearchKidResult: { id, firstname, lastname, family_id, family_name: string | null }
```
> Backs `GlobalSearch.tsx` in the dashboard topbar. `SearchService.search()` requires a 2+ character query, then fans out `Promise.all` across families/classes/kids (kids searched by first name OR last name via two parallel `ilike` queries, merged and deduped by id). Each result set capped at 6 rows (`RESULT_LIMIT`). No `search.validation.ts` — the query is a plain string, not a Zod-parsed body.

### Families (`families/families.types.ts`)
```typescript
Families: { id, name, status, plan, balance, tenant_id, created_at }

FamilyWithDetails: {
  id, name, status, plan, balance, created_at,
  primary_contact: string | null
  kids_count: number
}

FamilyDetail: {
  id, name, status, plan, balance, created_at,
  parents: FamilyParent[],
  kids: FamilyKid[]
}

FamilyParent: {
  id, firstname, lastname, phone_number, address,
  pick_up: boolean, is_active: boolean,
  date_of_birth, personal_number, created_at
}
```
> Parents are sorted by `created_at ASC` in `families.repository.ts` — first parent added stays first across all refreshes.

### Tenant Legal Info (`tenant_legal_info/tenant_legal_info.types.ts`)
```typescript
TenantLegalInfo: {
  id, tenant_id,
  legal_entity_name, country, tax_id, registration_number,
  street, city, postal_code,
  rep_name, rep_title, rep_email, rep_phone,
  updated_by: string | null, updated_at: string | null, created_at: string
}

CreateTenantLegalInfoDto: Omit<TenantLegalInfo, "id" | "updated_by" | "updated_at" | "created_at">
UpdateTenantLegalInfoDto: Partial<Omit<CreateTenantLegalInfoDto, "tenant_id">>
```
> Stored via upsert — service checks if a record exists for the tenant and updates or creates accordingly.

### Subscription Plans (`subscription_plans/subscription_plans.types.ts`)
```typescript
SubscriptionPlan: {
  id: string
  code: string       // snake_case: "starter" | "growth" | "enterprise"
  Name: string       // PascalCase — actual DB column name
  yearly_price: number
  is_active: boolean
}
```
> `Name` is PascalCase because the DB column is named `Name`. All other columns are snake_case.

### Tenant Subscriptions (`tenant_subscriptions/tenant_subscriptions.types.ts`)
```typescript
TenantSubscription: {
  id, tenant_id, plan_id, status,
  starts_at, ends_at,
  price_at_purchase: number,
  auto_renew: boolean,
  created_at
}

TenantSubscriptionWithPlan: TenantSubscription & {
  subscription_plans: { id: string; Name: string; yearly_price: number; is_active: boolean } | null
}
```

### Documents (`documents/documents.types.ts`)
```typescript
Documents: {
  id, file_url,        // storage path, not a URL
  kid_id: string | null
  user_id: string | null
  family_id: string | null
  created_at
}

DocumentWithSubject: {
  id, file_url,         // freshly signed URL
  storage_path: string  // raw storage path (for delete calls)
  kid_id, user_id, family_id,
  subject_name: string | null   // resolved kid/user/family name
  subject_type: "Family" | "Staff" | "Child" | null
  created_at
}
```
> Exactly one of `kid_id` / `user_id` / `family_id` is set per row — `DocumentsService.upload()` throws if none are provided. `getAllForTenant()` cross-references families/users/kids for the tenant to scope + label org-wide documents, then batch-signs URLs via `createSignedUrls()`.

### Class Checklist (`class_checklist_items/class_checklist_items.types.ts`, `family_checklist_progress/family_checklist_progress.types.ts`)
```typescript
ClassChecklistItem: {
  id, class_id, tenant_id,
  category: string          // free text — "Documents"/"Supplies"/"Comfort" are just UI defaults, not an enum
  item_name: string
  is_mandatory: boolean
  applies_to: string         // "All children" | "Not potty-trained" | "With allergies" | ...
  sort_order: number
  created_at
}

FamilyChecklistProgress: { id, kid_id, checklist_item_id, is_checked, checked_at }

// Summary rollup — used by the Checklist tab's "Needs attention" panel
KidChecklistProgress: { kid_id, kid_name, done: number, of: number, missing: string[] }

// Full detail — used by the Progress tab (every item, every kid, toggleable)
KidChecklistItemState: { checklist_item_id, item_name, category, is_mandatory, applies_to, is_checked }
KidChecklistDetail: { kid_id, kid_name, items: KidChecklistItemState[] }
```
> `getProgressForClass()` only counts mandatory items toward `done`/`of`; "All children" items count for every kid, narrower applies-to groups only count once a `family_checklist_progress` row already exists for that kid+item (no potty-trained/allergy flags exist on `kids` to derive this automatically). `getDetailedProgressForClass()` returns every item regardless of mandatory/applies-to, for the full per-kid toggle view.

### Class Hub (`class_hub_posts/`, `class_rules/`, `class_events/`)
```typescript
ClassHubPost: { id, class_id, tenant_id, author_id, post_type: string, body: string, created_at }
ClassHubPostWithAuthor: ClassHubPost & { author_name: string | null }

ClassRule: { id, class_id, tenant_id, rule_text, sort_order, created_at }

ClassEvent: { id, class_id, tenant_id, title, location: string | null, starts_at, ends_at: string | null, created_at }
```
> `post_type` is one of `"Daily note" | "Rule" | "Issue" | "Info"` (validated via Zod enum, stored as plain text). Posts can only be edited/deleted by their `author_id` — enforced at the repository layer (`.eq("author_id", authorId)` on update/delete) and surfaced as 403 in the route when the row doesn't match. Rules and events have no per-author ownership — any class staff can manage them.

### Incidents (`incidents/incidents.types.ts`)
```typescript
Incident: {
  id, kid_id, reported_by, tenant_id,
  incident_type: string
  description: string
  action_taken: string | null
  parent_notified: boolean
  notified_at: string
  severity: string        // "Low" | "Medium" | "High"
  created_at
}

IncidentWithDetails: Incident & { kid_name: string | null; reported_by_name: string | null }
```
> Scoped by `kid_id`, not `class_id` — `IncidentsService.getByClassId()` first resolves the class roster's kid ids via `KidsRepository.findKidsByClassId`, then queries `incidents` for those ids. Like Hub posts, delete is restricted to the original `reported_by` user (403 otherwise); there's no edit endpoint, only report + delete.

### Kid Attendance (`kid_attendance/kid_attendance.types.ts`)
```typescript
KidAttendance: {
  id, kid_id, class_id, date, tenant_id, created_at,
  check_in: string | null       // nullable — no check-in yet
  check_out: string | null      // nullable — no check-out yet (or absent)
  checked_in_by: string | null
  checked_out_by: string | null
  check_out_to: string | null   // FK → parents(id)
  back_up_check_out_to: string | null
  pickup_note: string | null
  absent_reason: string | null
  status: AttendanceStatus | null   // "pending" | "in" | "late" | "out" | "absent"
}

KidAttendanceWithDetails: KidAttendance & {
  kid_name: string | null
  checked_in_by_name: string | null
  checked_out_by_name: string | null
  check_out_to_name: string | null
}

AttendanceFilters: { dateFrom?, dateTo?, search?, checkedOutBy?, releasedTo?, status?, page, pageSize }
AttendanceStats: { presentRate30d: number, lateToday: number, absentToday: number }
```
> One row per kid per date, upserted (not inserted fresh) by `KidAttendanceRepository.upsertForKid()` — it looks up an existing kid_id+date row first (same find-then-update-or-insert pattern as `family_checklist_progress`), since the schema has no unique constraint on `(kid_id, date)`. Check-in past 9:00am is auto-marked `"late"` instead of `"in"`. `check_in`/`check_out` were originally `NOT NULL` in the schema the user provided; both were altered to nullable in Supabase before this module was built, so a row can honestly represent "checked in, not yet out" or "absent" without sentinel timestamps.

### Food Supplies (`food_supplies/food_supplies.types.ts`)
```typescript
FoodSupply: {
  id, tenant_id, location_id, created_by, created_at,
  vendor_name: string | null
  purchase_date: string
  total_cost: number
  receipt_storage_path: string | null   // nullable — photo is optional, not every receipt gets one
}

FoodSupplyItem: { id, supply_id, item_name, quantity: number | null, unit: string | null, unit_cost: number | null, line_total: number }

FoodSupplyWithDetails: FoodSupply & { location_name: string | null, created_by_name: string | null, items_count: number, receipt_url: string | null }
FoodSupplyWithItems: FoodSupply & { items: FoodSupplyItem[], receipt_url: string | null }
```
> `receipt_storage_path` was originally `NOT NULL` in the schema the user provided; altered to nullable in Supabase partway through this module's build once the user decided staff should be able to save a receipt with no photo at all (manual entry only). Every layer — types, repository (`findAllForTenant`/`findById` skip signed-URL generation when the path is null), service (`upload()` only touches Storage when a `file` is present), and the route — treats the photo as fully optional; `FoodSuppliesService.delete()` only calls `removeFile()` when a path exists. Private `receipt` bucket (singular — user corrected this from the initially-planned `receipts`), signed URLs with a 7-day TTL.
>
> `food_supplies.parser.ts` (`parseReceiptImage()`) sends the photo to Claude (`claude-opus-4-8`, vision + `output_config.format: json_schema`) and returns a `ParsedReceipt` — the upload modal calls this immediately on file pick (not a separate "Scan" button) and pre-fills vendor/date/total/items, flagging any row the model wasn't confident about (`confidence: "low"`) with an amber highlight. Scanning is best-effort: a parse failure (or no photo at all) never blocks saving, it just leaves the fields for manual entry.

### Class Menus (`class_menus/class_menus.types.ts`)
```typescript
ClassMenu: {
  id, tenant_id, class_id, created_by, created_at,
  date: string
  meal_type: "breakfast" | "snack" | "lunch"
  description: string
}
```
> One row per class+date+meal_type (`UNIQUE(class_id, date, meal_type)` in the DB). `ClassMenusService.getWeek()` always synthesizes all 15 grid cells (5 weekdays × 3 meals) even when a cell has no row yet, so the weekly grid renders a full shape from day one. `saveCell()` is a find-then-branch upsert (same pattern as `kid_attendance`/`family_checklist_progress`) rather than relying on Supabase's `.upsert()` + `onConflict`. Powered by a new lightweight `GET /api/classes/light` endpoint ({id, name} only) for the class-picker, since the existing `/api/classes` does extra joins/counts not needed here — note `classes` itself has no `tenant_id` column (pre-existing gap, not introduced by this module), so `findAllLight()` is unscoped by tenant like the rest of the classes module.

---

## Plan Constants (`lib/plans.ts`)

Single source of truth for all plan data — imported by billing-plan page, PricingSection, FAQ, etc.

```typescript
export type PlanInfo = {
  code: string        // "starter" | "growth" | "enterprise"
  name: string        // "Starter" | "Growth" | "Enterprise"
  description: string
  price: number       // yearly price in EUR
  features: string[]
  cta: string
  highlighted: boolean
}

export const PLANS: PlanInfo[] = [
  {
    code: "starter", name: "Starter", price: 320,
    features: ["Up to 35 children", "Attendance tracking", "Parent messaging", "10 staff accounts", "Email support"]
  },
  {
    code: "growth", name: "Growth", price: 790,
    features: ["Up to 100 children", "Advanced reports & analytics", "Parent portal", "Activity planning", "25 staff accounts", "Priority support"]
  },
  {
    code: "enterprise", name: "Enterprise", price: 1590,
    features: ["Unlimited children", "Multiple locations", "Custom branding", "Unlimited staff accounts", "Dedicated account manager", "API access", "SLA guarantee"]
  },
]

export function getPlanByCode(code: string): PlanInfo | undefined
export function getPlanByName(name: string): PlanInfo | undefined
```

---

## Settings Pages (`/dashboard/settings/*`)

All settings pages are **client components** that fetch real data on mount.

The settings shell (`settings/layout.tsx`) provides a vertical sidebar nav (desktop) that collapses to a horizontal scrollable chip strip on mobile.

### General (`/dashboard/settings/general`)
- Fetches `GET /api/tenant-legal-info` and `GET /api/tenant_subscriptions` in parallel
- **Read-only subscription card**: current plan name, status, billing period, auto-renew flag
- **Three editable sections**: Legal entity, Registered address, Authorized representative
- Submits all sections together via `PUT /api/tenant-legal-info`
- Logs activity as `"Legal info"` entity

### Currency (`/dashboard/settings/currency`)
- Full CRUD against `/api/currency` and `/api/currency/[id]` (no `logActivity` on these routes — the only settings CRUD page that doesn't log)
- `CurrencyModal`'s picker is a searchable combobox (`CurrencyPicker`) over a static ~155-entry ISO 4217 list (`world-currencies.ts`) — search-as-you-type filters by code, name, or symbol; selecting an entry sets both `currency` and `symbol` together so they can't drift out of sync
- Empty state with CTA when no currencies exist; footer shows total count
- Currencies added here populate the `<select>` in the Staff → Salary tab's "add record" form

### Locations (`/dashboard/settings/locations`)
- Full CRUD against `/api/locations` and `/api/locations/[id]`
- List, add (LocationModal), edit (LocationModal pre-populated), delete (DeleteConfirm)
- Empty state with CTA when no locations exist
- Footer shows total location count

### Billing Plan (`/dashboard/settings/billing-plan`)
- Fetches `GET /api/tenant_subscriptions` (current plan + join to `subscription_plans`)
- Fetches `GET /api/subscription_plans` (all available plans)
- **Plan hero**: name, status badge, billing period, progress bar (calculates % between starts_at/ends_at)
- **Expiry warning**: shown when ≤ 30 days remain
- **4 stat cards**: Days remaining, Price paid, Auto-renew, Plan status
- **Feature list**: pulled from `getPlanByName()` in `lib/plans.ts`
- **Other plans**: displayed as cards with `mailto:support@kinderhub.io` upgrade links (pre-filled subject/body)

### Data & Privacy (`/dashboard/settings/data-privacy`)
Informational page with 5 sections:
1. **Compliance status**: GDPR, encryption, server location, COPPA note
2. **Data retention**: cancellation window, log retention, backup cadence
3. **Legal documents**: Privacy Policy, ToS, DPA, Cookie Policy (available on request via `legal@kinderhub.io`)
4. **Export data**: client-side CSV export using `Blob + URL.createObjectURL`; fetches existing API endpoints; individual per-dataset + "Export all" bulk button
5. **Right to erasure**: warning banner + pre-filled `mailto:privacy@kinderhub.io` GDPR Article 17 request; button becomes confirmation message after click

### Team & Access (`/dashboard/settings/team`)
- Fetches `GET /api/departments`, `GET /api/users/with-department`, `GET /api/locations` in parallel
- **Department cards**: color-coded, show member count; click to filter staff table; "Add department" button
- **Add Department modal**: name + location picker (locations from `/api/locations`); graceful notice if no locations exist; POSTs to `/api/departments`
- **Staff table**: name + avatar initials, position, department, active/inactive badge, join date, link to profile
- **Roles list**: 6 roles (Owner → Parent portal) with scope descriptions; external roles tagged
- **Permission matrix**: 9 resources × 6 roles with color-coded Full/Edit/View/Own-only/None cells + legend

---

## Class Detail Page (`/dashboard/classes/[id]`)

Fully live — fetches from DB via `ClassesService`, `KidsService`, and `WaitlistService`.

### Layout
- **Hero header**: class icon (first letter), name + age-range pill + Active status pill, location/lead meta, capacity ring SVG
- **Tab strip**: Roster, Schedule, Attendance, Incidents, Curriculum, Checklist, Progress, Hub, Documents — rendered by `TabStrip` (a sub-component of `ClassTabs.tsx`), horizontally scrollable with left/right chevron nav arrows that only render on screens ≤1023px and only when there's more to scroll in that direction
- **KPI strip** (4 cards, always visible): Enrolled, Spots open, Waitlist count, Age group
- Two-column tabs (Checklist, Hub) use the shared `.kh-tab-split-grid` CSS class (1.55fr/1fr desktop, single column ≤1023px)

### Roster Tab
- Live roster table: child name + avatar, gender, date of birth, age, chevron
- **Add children**: Multi-select modal (`AddChildModal`) — search by name, checkbox per child, assigns all selected in parallel via `PUT /api/kids/:classId/kids/:kidId`
- **Waitlist table** (`WaitlistTable`): kid search picker (fetches unassigned-for-this-class kids from `GET /api/waitlist/:classId`), adds via `POST /api/waitlist/:classId` with `kid_id`, displays joined name/dob/age, delete button

### Schedule Tab (`ClassTabs.tsx → ScheduleTab`)
- **Class info card**: start date, end date, location, lead, assistant
- **Weekly schedule grid**: days as columns, each active day shows an opens/closes card
- **Edit button** (pencil icon): opens `ScheduleEditModal` — same day-toggle + apply-all + per-day time pickers as create form. Saves via `PATCH /api/classes/[id]`, updates UI without page reload

### Take Attendance modal (`TakeAttendanceButton.tsx` + `TakeAttendanceModal.tsx`)
- Triggered from the "Take attendance" button in the class hero topbar (`page.tsx`) — previously a dead button with no handler
- Loads today's roster merged with any existing `kid_attendance` rows via `GET /api/classes/[id]/attendance/[date]`; kids with no row yet show as synthetic "pending" entries so the full roster is always visible
- Per-kid quick actions: **Check in** / **Absent** (pending) → **Check out** (in/late) → **Edit** (out) — each PUTs immediately, no batch save step
- Expanding a row inline shows the absent-reason field, or the check-out detail (released-to parent dropdown sourced from `GET /api/kids/[class_id]/kids/[kid_id]/parents`, backup-person text field, pickup note)
- "Mark all present" bulk-checks every still-pending kid
- **Live feedback**: a dismissing toast banner confirms each save ("X was checked out.", "Marked N children present.") and calls `notifyAttendanceUpdated(classId)` so the Attendance tab refetches immediately, even while the modal is still open
- Footer shows a live in/late/out/absent/pending breakdown; "Close" just dismisses the modal (nothing to explicitly save — every action already persisted)

### Attendance Tab (`AttendanceTab.tsx`)
- Stat cards: 30-day present rate, late today, absent today (`KidAttendanceService.getStatsForClass`)
- Filter bar: child-name search (applied client-side post-fetch since it's on a joined field), date range, "Checked out by" staff dropdown (`GET /api/users`), status dropdown — all drive `GET /api/classes/[id]/attendance` with query params, server-paginated (`page`/`pageSize`, default 20/page)
- Table: child, date, check-in/out times + who recorded them, released-to (parent avatar or "Backup" pill + name), pickup note or absent reason, status pill
- **Export to Excel** button carries the tab's current filters (minus pagination) into `GET /api/classes/[id]/attendance/export`
- Listens for the same `onAttendanceUpdated(classId, …)` event the Take Attendance modal fires, so records recorded while the tab is mounted appear without a manual refresh

### Incidents Tab (`IncidentsTab.tsx`)
- Lists incidents for every kid currently in the class roster (resolved via `IncidentsService.getByClassId` → looks up roster kid ids, then queries `incidents` by `kid_id`)
- Each entry: child, incident type, severity pill (⚠ on High), description, action taken, reporter name, parent-notification status (green/timestamped if notified, red if not)
- **Report incident** button opens a modal: child picker (class roster only), type, severity, description, action taken, parent-notified checkbox + notified-at datetime
- **Delete** only shown/allowed on incidents reported by the current session user (`reported_by` ownership check both client-side via `GET /api/auth/me` and server-side in the route, 403 otherwise)

### Checklist Tab (`ChecklistTab.tsx`)
- **Left**: checklist items grouped into category cards (categories are whatever exists in the data, not hardcoded — `Documents`/`Supplies`/`Comfort` are just the default suggestions offered when creating a new category). Each item row shows its name, applies-to pill, mandatory/optional pill, and a delete button
- **Add item**: inline form, either inside an existing category card (category locked) or from the standalone "Add checklist item" row above the cards (lets you pick an existing category or type a new one via "Custom…")
- **Right — "Needs attention"**: only kids with at least one incomplete mandatory item show up here (`done < of`), with a progress bar and pills for each missing item name. Kids who are fully done disappear from this panel — see the Progress tab for the complete picture
- **Applies-to groups** reference card explaining "All children" / "Not potty-trained" / "With allergies"
- Since `kids` has no potty-trained/allergy flags, non-"All children" applies-to items only count toward a kid's total once a progress row already exists for that kid+item (see `FamilyChecklistProgressService.getProgressForClass`)

### Progress Tab (`ProgressTab.tsx`)
- One card per **every** enrolled kid (complete or not), each listing every checklist item as a live checkbox (checked/unchecked, mandatory items tagged)
- Toggling a checkbox optimistically updates the UI and calls `PUT /api/classes/[id]/checklist/progress` (upserts `family_checklist_progress`); reverts on failure
- Backed by `GET /api/classes/[id]/checklist/progress/detail`, which returns every checklist item × every roster kid with its checked state (`FamilyChecklistProgressService.getDetailedProgressForClass`)

### Hub Tab (`HubTab.tsx`)
- **Left — composer + feed**: post-type segmented picker (Daily note / Rule / Issue / Info), textarea, "Post" button; feed shows author, type pill, relative timestamp, body. Posts you authored show edit (inline textarea) and delete controls — enforced both client-side (`GET /api/auth/me`) and server-side (`author_id` ownership check, 403 otherwise)
- **Right — pinned rules**: numbered list with inline "Add rule" and per-row delete (no ownership restriction — any class staff can manage rules)
- **Right — events**: date-block list (day/month, title, time, location) with a "New event" mini-form (title, datetime-local, optional location) that posts to the hub feed

---

## Employee Detail Page (`/dashboard/staff/[id]`)

The most feature-rich page — component-split architecture.

### Server Layer (`page.tsx`)
- Fetches `UserService.getById(id, tenant_id)`, `SalaryTrackingService.getActiveByUser(id)`, and `UserProfilesService.getByUser(id)` (3 parallel-ish awaits, not batched into one query — each is a separate small lookup, not a list, so the cost is negligible)
- Returns `notFound()` if user missing or error
- Renders full-page hero with `<ProfileAvatar>` (photo-or-initials, click to upload), status badge, name, position, contact info, and a Salary stat card that renders the active record's amount with its actual currency symbol (`activeSalary.symbol`) — previously hardcoded to `$`
- Passes `user` and `userId` to client `<EmployeeTabs>`

### `user.repository.ts` — `findById` key logic
- Selects `work_tracking` joined with `departments`, including `end_date`
- Also joins `salary_tracking` (with `currency.symbol`) and `address` in the same `select()`
- Picks active record JS-side: `find(wt => wt.end_date === null) ?? [0] ?? null` (same pattern reused for the active salary record)
- Guards `Array.isArray(wt?.department)` / `Array.isArray(data.address)` for PostgREST join cardinality variance

### `user.repository.ts` — `findAllWithWorkTrackingAndDepartment` (staff list) key logic
- Same single-query principle: embeds `user_profiles(file_url, created_at)` alongside `work_tracking` in one `select()` — the whole staff table's profile pictures come back in one Postgres round trip, not one query per row
- `getPublicUrl()` is called per row in the JS mapper; this is free (string construction only, no network/DB cost) since the `profiles` bucket is public

### Client Tab Components
| Component | Data source | Edit |
|-----------|-------------|------|
| `PersonalCard` | `user.user.*` + `user.address` (read-only formatted line) | PATCH `/api/users/[id]` (address not yet editable) |
| `AccountCard` | `user.user.*` | No (read-only) |
| `EmploymentCard` | `user.*` (work tracking fields) | PATCH `/api/users/[id]` |
| `ScheduleTab` | GET `/api/users/[id]/classes` | No |
| `SalaryTab` | GET `/api/users/[id]/salary` + GET `/api/currency` (for the add-form dropdown) | POST (adds + closes previous active) / DELETE |
| `SalaryCard` | `user.salary` (Overview tab summary) | No (read-only) |
| `ProfileAvatar` | `initialUrl` prop from server + local state after upload | POST/DELETE `/api/users/[id]/profile-picture` |
| `DocumentsTab` | GET `/api/users/[id]/documents` (or `/api/families/[id]/documents` when rendered with `familyId`) | POST / DELETE |
| `WorkHistoryModal` | GET/POST `/api/users/[id]/work-tracking` | POST (add new position) |

### Supabase Storage (Documents)
- **Bucket**: `documents` (private)
- **Upload path**: `{userId}/{timestamp}_{filename}`
- **DB stores**: Storage path (not URL) in `file_url` column
- **Read**: Batch `createSignedUrls()` with 7-day TTL on every GET
- **`toStoragePath()`**: Backward-compat helper extracts path from old full URLs

### Supabase Storage (Profile Pictures)
- **Bucket**: `profiles` (**public**, unlike `documents`)
- **Upload path**: `{userId}/{timestamp}_{filename}`
- **DB stores**: Storage path in `user_profiles.file_url`; `getPublicUrl()` derives the browsable URL on read (no signing, no expiry)
- **Replace semantics**: uploading a new picture uploads the new file first, then deletes the old DB row + old storage object — never more than one active picture per user
- **Validation**: `image/jpeg|png|webp|gif` only, ≤5MB, enforced in `UserProfilesService.upload()`

---

## Subscribe Page (`/subscribe`)

Public page (no auth required) for onboarding new tenants.

- Reads `?plan_id=` from query string — calls `SubscriptionPlanService.getById()` server-side, shows `notFound()` if missing
- `SubscribeForm` (client, 2-step wizard):
  - **Step 1** — Create organization: name + auto-slugified slug (editable), POST `/api/tenants`
  - **Step 2** — Confirm plan: shows plan name + yearly price, auto-renew toggle, POST `/api/tenant_subscriptions`
  - Success screen on completion

---

## Shared UI Components

### `Modal.tsx` — Base modal + form primitives
- Backdrop click + ESC key to close
- Exports: `Modal`, `MField`, `MSection`, `MInput`, `MSelect`, `MToggle`, `MSegmented`, `MGrid`, `MBtn`

### `AddClassModal.tsx`
- Per-day schedule builder with `Monday–Sunday` toggle chips
- `globalOpens/globalCloses` + "Apply to all" copies times to all active days
- Per-day time rows: `grid-template-columns: 120px 1fr 16px 1fr`
- Builds `schedule` JSON: `{ Monday: { opens, closes }, ... }` for DB
- **Start date / End date** pickers (DATE type) with quick-pick buttons: **+3 mo**, **+6 mo**, **+1 yr**
  - Start date picks from today; end date picks relative to the start date if set

### `AddFamilyModal.tsx` — 5-step wizard
1. **Family** — name, status, plan
2. **Guardians** — one or more guardians with name, phone, DOB, personal number, address, pickup authorization
3. **Children** — one or more kids with name, DOB, gender, personal number
4. **Class** — per-child class assignment:
   - Fetches `/api/classes/with-enrollment` (live capacity counts)
   - Capacity bar (green → red when full)
   - Auto-checks waitlist when class is full; manual override always available
   - Note field appears when waitlist is checked
5. **Review** — summary of all data + class assignments with Enrolled/Waitlist badges

On submit: creates family → guardians → kids sequentially; then for each kid with a class assignment either enrolls directly (`PUT /api/kids/:classId/kids/:kidId`) or adds to waitlist (`POST /api/waitlist/:classId` with `kid_id`).

### `DataTable.tsx`
- Generic `<T>` typed server component
- Functions cannot cross RSC boundary — clickable rows use `<Link>` inside cells

---

## Pages Summary

| Page | Route | Data | Real DB |
|------|-------|------|---------|
| Overview | `/dashboard` | Mock | No |
| Staff | `/dashboard/staff` | Live (UserService) | Yes |
| Employee Detail | `/dashboard/staff/[id]` | Live (UserService + APIs) | Yes |
| Families | `/dashboard/families` | Live (FamiliesService) | Yes |
| Family Detail | `/dashboard/families/[id]` | Live (FamiliesService + DocumentsService via shared DocumentsTab) | Yes |
| Classes | `/dashboard/classes` | Live (ClassesService) | Yes |
| Class Detail | `/dashboard/classes/[id]` | Live (ClassesService + KidsService + WaitlistService) | Yes |
| Subscribe | `/subscribe` | Live (SubscriptionPlanService) | Yes |
| Settings — General | `/dashboard/settings/general` | Live (TenantLegalInfoService + tenant_subscriptions) | Yes |
| Settings — Currency | `/dashboard/settings/currency` | Live (CurrencyService) | Yes |
| Settings — Locations | `/dashboard/settings/locations` | Live (LocationService) | Yes |
| Settings — Billing Plan | `/dashboard/settings/billing-plan` | Live (tenant_subscriptions + subscription_plans) | Yes |
| Settings — Data & Privacy | `/dashboard/settings/data-privacy` | Informational + client-side CSV export | Partial |
| Settings — Team | `/dashboard/settings/team` | Live (departments + users with-department) | Yes |
| FAQ | `/faq` | Static | No |
| Billing | `/dashboard/billing` | Mock | No |
| Messages | `/dashboard/messages` | Mock | No |
| Documents | `/dashboard/documents` | Live (DocumentsService) | Yes |
| Calendar | `/dashboard/calendar` | Mock | No |
| Food Supplies | `/dashboard/food-menus/supplies` | Live (FoodSuppliesService) | Yes |
| Class Menus | `/dashboard/food-menus/menus` | Live (ClassMenusService + classes/light) | Yes |

---

## Known Issues / Technical Notes

1. **Hardcoded tenant ID** in `lib/db.ts` (`8c0785e5-83cc-4fa3-9957-75ae61b50d37`) — prototype bootstrap pattern, not production-ready
2. **`responsible_user_name` always null** — `work_tracking.responsible_user_id` has no FK constraint to `users`, so PostgREST join is impossible without schema change
3. **Supabase PostgREST join filter limitation** — filtering on joined table rows in `.select()` acts as an inner join and can null the parent; workarounds use JS-side filtering post-fetch
4. **RSC boundary constraint** — functions (cell renderers, click handlers) cannot be serialized across the server→client boundary. Clickable rows use `<Link>` inside cell renderers
5. **Hydration / layout flash** — `DashboardShell` reads localStorage in `useEffect` (not during SSR). The shell uses `suppressHydrationWarning` to silence the className diff and fades in `kh-main` via opacity once mounted, eliminating the visible collapse/stretch flash on page refresh
6. **`GET /api/kids`** returns only kids with `class_id IS NULL` (unassigned) — intentional for the child-picker modals. Fetching all kids or kids by class uses separate endpoints
7. **Mixed column casing in `subscription_plans`** — the `Name` column is PascalCase in the DB (must be quoted in raw SQL). All modules use the exact column name as returned by PostgREST. `SubscriptionPlan.Name` is intentionally PascalCase in TypeScript to match.
8. **Tenant legal info upsert** — `TenantLegalInfoService.upsert()` checks for an existing record before deciding to INSERT or UPDATE, since a tenant may or may not have a row yet. No separate POST/PATCH endpoints needed.
9. **No "who am I" endpoint until Hub/Incidents needed it** — `GET /api/auth/me` was added specifically so client components (`HubTab`, `IncidentsTab`) can compare the logged-in user's id against `author_id`/`reported_by` to conditionally show edit/delete. `getTenant()` itself only works server-side (reads an httpOnly cookie via `next/headers`), so this is the one client-facing session read in the app.
10. **Author/reporter-scoped delete pattern** — Hub posts and Incidents both restrict update/delete to the row's own `author_id`/`reported_by` via a `.eq()` filter at the repository layer, not just tenant scope. A delete affecting zero rows throws (checked via `.select("id")` after the mutation) so the route can return a true 403 instead of a false-positive 204. Class rules and events have no such restriction — any class staff can manage them.
11. **Family "Activity" tab is computed, not logged** — waitlist→enrollment transfers shown on a family's Activity tab (`ClassTransferEvent`) are derived live from `waitlists` + `kids.class_id` on every request, not written to a persisted activity log. Nothing to clean up if a kid transfers again; the tradeoff is it can only ever show the *current* mismatch state, not a full history of past transfers.
12. **Checklist "applies to" groups aren't derived from kid data** — `kids` has no potty-trained/allergy columns, so `FamilyChecklistProgressService.getProgressForClass()` can't automatically know which kids a non-"All children" item applies to. It only counts such an item toward a kid's total once a `family_checklist_progress` row already exists for that kid+item.
13. **Cross-component live refresh via window CustomEvent, not React state** — `TakeAttendanceModal` and `AttendanceTab` are siblings with no shared parent state (the modal is triggered from the class hero in `page.tsx`; the tab lives inside `ClassTabs.tsx`). Rather than prop-drilling or introducing context, `lib/attendance-events.ts` dispatches a `window` CustomEvent scoped by `classId` on every successful attendance mutation, and `AttendanceTab` listens for it to refetch. This is the first use of this pattern in the app — if a similar "two unrelated client components need to stay in sync" need comes up elsewhere, reuse or extend this helper rather than adding a new ad hoc mechanism.
14. **`/api/kids/[class_id]/kids/[kid_id]/parents` has an unused `class_id` param** — it exists purely because Next.js requires all dynamic segments at the same path depth to share a param name, and `[class_id]` was already taken by the sibling PUT route. The handler only reads `kid_id`; `class_id` is accepted but ignored.
15. **Address has no update endpoint** — `address` rows are created once alongside a new user (`UserService.create()` → `AddressService.create()`) and displayed read-only on the staff Personal Information card. There's no PATCH route or edit UI yet; if a staff member's address needs to change after creation, it currently can't be done through the app.
16. **Currency routes don't call `logActivity`** — `/api/currency` and `/api/currency/[id]` are the one settings CRUD surface that doesn't log to the activity feed, unlike Locations/Departments/etc. Not intentional design, just not wired up yet.
17. **`salary_tracking` create() originally dropped the currency join** — a real bug hit during development: `SalaryTrackingRepository.create()` did a plain `.select()` after insert with no `currency(symbol)` join (unlike `findByUser`/`findActiveByUser`, which both had it), so a freshly-added salary record rendered with no currency symbol until the page was refreshed. Fixed by adding the same join to the insert's `.select()`.
18. **"Publish to parents" on Class Menus is decorative** — the mockup shows a toggle/pill implying parent-portal visibility, but `class_menus` has no supporting column for it. Left as a no-op in the UI rather than fabricating new schema; revisit if/when parent-portal visibility is actually scoped.
19. **Food supply "Awaiting review" stat is hardcoded to 0** — there's no review-queue/flagging workflow persisted anywhere; low-confidence OCR rows are a per-save, in-modal concern only (never written to the DB), so nothing is actually "awaiting" anything yet. The stat card exists to match the mockup and is ready for a future review-queue feature.
20. **`food_supply_items` has no `ON DELETE CASCADE`** — `FoodSuppliesService.delete()` explicitly deletes the item rows before deleting the parent `food_supplies` row to avoid orphaning them.

---

## Database Schema Reference

`database.md` (project root) is a raw `CREATE TABLE` dump of the live Supabase schema — context/reference only, not meant to be run (table order and constraints aren't guaranteed valid for execution). Useful for checking a column's exact type/nullability without opening the Supabase dashboard.

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
ANTHROPIC_API_KEY=...
```

### Supabase Storage
- Bucket name: `documents`
- Endpoint: `https://zhlehpihbfcpwfbhmyqm.storage.supabase.co/storage/v1/s3`
- Region: `eu-west-1`
- Bucket must be **private** — access via signed URLs only
- Second bucket: `receipt` (singular) — private, food supply receipt photos, signed URLs with 7-day TTL, path convention `${tenantId}/${Date.now()}_${sanitizedFilename}`

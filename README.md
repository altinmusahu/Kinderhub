<div align="center">

![Kinderhub Banner](public/06-banner-hero.webp)

# kinder*hub*

**The quiet, capable CRM behind every great childcare program.**  
Families, attendance, billing and messages — all in one place.

[![Next.js](https://img.shields.io/badge/Next.js-App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## What it is

Kinderhub is a multi-tenant CRM dashboard built for childcare directors and staff. It handles the operational side of running a program — family records, staff management, class scheduling, billing, and document storage — wrapped in a warm, considered design system built from the ground up.

---

## Brand

<table>
<tr>
<td width="50%">

![Now Enrolling poster](public/07-poster-now-enrolling.webp)

</td>
<td width="50%">

![A home for growing poster](public/08-poster-a-home-for-growing.webp)

</td>
</tr>
<tr>
<td width="50%">

![Spring Picnic poster](public/09-poster-spring-picnic.webp)

</td>
<td width="50%">

![Social posts](public/10-social-posts.webp)

</td>
</tr>
</table>

<table>
<tr>
<td width="50%">

![Business cards](public/11-business-cards.webp)

</td>
<td width="50%">

![App icon sheet](public/12-app-icon-sheet.webp)

</td>
</tr>
</table>

![Tote and signage](public/13-tote-and-signage.webp)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router, server components) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + custom `kh-*` design system |
| Database | Supabase (PostgreSQL) |
| Auth | Custom JWT via Web Crypto API (HMAC-SHA256) |
| Storage | Supabase Storage — private bucket, signed URLs |
| Validation | Zod |

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
```

---

## Project structure

```
app/
├── dashboard/
│   ├── staff/[id]        Employee detail — tabs, documents, work history
│   ├── families/[id]     Family detail — children, parents, billing
│   ├── classes/          Class scheduling
│   ├── billing/          Invoices and revenue
│   └── settings/         Departments, roles, team
├── api/
│   ├── modules/          Service / Repository / Validation / Types per entity
│   └── ...               Route handlers (auth, users, families, parents, kids…)
components/
└── ui/                   Modal system, AddStaffModal, AddFamilyModal, DataTable…
lib/
└── auth.ts               JWT sign / verify / cookie helpers
```

See [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) for the full architecture reference.

---

<div align="center">

*Four rooms. One big family. Each with its own light, its own pace,*  
*and a caregiver who knows every name.*

**kinderhub.co**

</div>

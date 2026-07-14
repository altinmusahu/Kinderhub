-- Adds a nullable FK from users to the new roles table, for the Roles & Permissions module.
-- Does NOT drop users.role (existing free-text column) or backfill role_id — both are manual
-- follow-ups after the seeded role names are reviewed per tenant.

alter table public.users
  add column role_id uuid null references public.roles (id);

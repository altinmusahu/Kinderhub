-- One-off backfill for tenants that predate the Roles & Permissions feature:
-- 1. Inserts any of the 5 default roles a tenant is missing (matched by name, per tenant).
-- 2. Fills in role_permissions for every role matching those names (old rows and the
--    ones just inserted in step 1), whatever their tenant.
-- Both steps are safe to re-run: step 1 skips tenants that already have a same-named
-- role, step 2 uses ON CONFLICT DO NOTHING so it never overwrites a level you've
-- already customized.

-- Step 1: insert missing roles, one set per tenant that doesn't already have them
insert into public.roles (tenant_id, name, color, is_system, is_owner_role)
select t.id, v.name, v.color, true, v.name = 'Owner'
from public.tenants t
join (
  values
    ('Owner',        '#8B5CF6'),
    ('Admin',        '#F59E0B'),
    ('Lead Teacher', '#3B82F6'),
    ('Assistant',    '#10B981'),
    ('Staff',        '#6B7280')
) as v(name, color) on true
where not exists (
  select 1 from public.roles r where r.tenant_id = t.id and r.name = v.name
);

-- Step 2: fill in role_permissions for every role matching these names
insert into public.role_permissions (tenant_id, role_id, resource, level)
select r.tenant_id, r.id, v.resource, v.level
from public.roles r
join (
  values
    -- Owner — full on everything
    ('Owner', 'families',      'full'),
    ('Owner', 'children',      'full'),
    ('Owner', 'staff',         'full'),
    ('Owner', 'classes',       'full'),
    ('Owner', 'attendance',    'full'),
    ('Owner', 'incidents',     'full'),
    ('Owner', 'curriculum',    'full'),
    ('Owner', 'hub',           'full'),
    ('Owner', 'documents',     'full'),
    ('Owner', 'food_supplies', 'full'),
    ('Owner', 'billing',       'full'),
    ('Owner', 'messages',      'full'),
    ('Owner', 'calendar',      'full'),
    ('Owner', 'settings',      'full'),
    ('Owner', 'legal_entity',  'full'),

    -- Admin — full on everything except legal_entity
    ('Admin', 'families',      'full'),
    ('Admin', 'children',      'full'),
    ('Admin', 'staff',         'full'),
    ('Admin', 'classes',       'full'),
    ('Admin', 'attendance',    'full'),
    ('Admin', 'incidents',     'full'),
    ('Admin', 'curriculum',    'full'),
    ('Admin', 'hub',           'full'),
    ('Admin', 'documents',     'full'),
    ('Admin', 'food_supplies', 'full'),
    ('Admin', 'billing',       'full'),
    ('Admin', 'messages',      'full'),
    ('Admin', 'calendar',      'full'),
    ('Admin', 'settings',      'full'),
    ('Admin', 'legal_entity',  'none'),

    -- Lead Teacher
    ('Lead Teacher', 'families',      'own_only'),
    ('Lead Teacher', 'children',      'own_only'),
    ('Lead Teacher', 'staff',         'none'),
    ('Lead Teacher', 'classes',       'own_only'),
    ('Lead Teacher', 'attendance',    'own_only'),
    ('Lead Teacher', 'incidents',     'own_only'),
    ('Lead Teacher', 'curriculum',    'own_only'),
    ('Lead Teacher', 'hub',           'own_only'),
    ('Lead Teacher', 'documents',     'own_only'),
    ('Lead Teacher', 'food_supplies', 'none'),
    ('Lead Teacher', 'billing',       'none'),
    ('Lead Teacher', 'messages',      'edit'),
    ('Lead Teacher', 'calendar',      'edit'),
    ('Lead Teacher', 'settings',      'none'),
    ('Lead Teacher', 'legal_entity',  'none'),

    -- Assistant
    ('Assistant', 'families',      'own_only'),
    ('Assistant', 'children',      'own_only'),
    ('Assistant', 'staff',         'none'),
    ('Assistant', 'classes',       'own_only'),
    ('Assistant', 'attendance',    'own_only'),
    ('Assistant', 'incidents',     'own_only'),
    ('Assistant', 'curriculum',    'own_only'),
    ('Assistant', 'hub',           'own_only'),
    ('Assistant', 'documents',     'own_only'),
    ('Assistant', 'food_supplies', 'none'),
    ('Assistant', 'billing',       'none'),
    ('Assistant', 'messages',      'view'),
    ('Assistant', 'calendar',      'view'),
    ('Assistant', 'settings',      'none'),
    ('Assistant', 'legal_entity',  'none'),

    -- Staff
    ('Staff', 'families',      'none'),
    ('Staff', 'children',      'none'),
    ('Staff', 'staff',         'own_only'),
    ('Staff', 'classes',       'none'),
    ('Staff', 'attendance',    'none'),
    ('Staff', 'incidents',     'none'),
    ('Staff', 'curriculum',    'none'),
    ('Staff', 'hub',           'none'),
    ('Staff', 'documents',     'none'),
    ('Staff', 'food_supplies', 'full'),
    ('Staff', 'billing',       'none'),
    ('Staff', 'messages',      'none'),
    ('Staff', 'calendar',      'view'),
    ('Staff', 'settings',      'none'),
    ('Staff', 'legal_entity',  'none')
) as v(role_name, resource, level)
  on v.role_name = r.name
on conflict (role_id, resource) do nothing;

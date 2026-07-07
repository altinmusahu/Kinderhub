-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  name character varying NOT NULL DEFAULT ''::character varying,
  lastname character varying NOT NULL DEFAULT ''::character varying,
  phone_number text NOT NULL DEFAULT ''::text,
  personal_number text NOT NULL DEFAULT ''::text,
  role character varying NOT NULL DEFAULT ''::character varying,
  created_at date NOT NULL,
  is_active boolean NOT NULL,
  date_of_birth date NOT NULL,
  tenant_id uuid NOT NULL,
  password_hash text NOT NULL,
  is_first_login_executed boolean NOT NULL DEFAULT false,
  email text NOT NULL UNIQUE,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.tenants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at date NOT NULL,
  CONSTRAINT tenants_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  Name text NOT NULL,
  yearly_price numeric NOT NULL,
  is_active boolean DEFAULT true,
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tenant_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  status USER-DEFINED NOT NULL,
  starts_at date NOT NULL,
  ends_at date NOT NULL,
  price_at_purchase numeric NOT NULL,
  auto_renew boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tenant_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT tenant_subscriptions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
  CONSTRAINT tenant_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id)
);
CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  is_active boolean NOT NULL,
  tenant_id uuid NOT NULL,
  location_id uuid,
  CONSTRAINT departments_pkey PRIMARY KEY (id),
  CONSTRAINT departments_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id)
);
CREATE TABLE public.locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  street character varying NOT NULL,
  house_number character varying DEFAULT 'NULL'::character varying,
  postal_code character varying DEFAULT 'NULL'::character varying,
  city character varying NOT NULL,
  country character varying NOT NULL,
  CONSTRAINT locations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.work_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  department_id uuid DEFAULT gen_random_uuid(),
  start_date date NOT NULL,
  end_date date,
  responsible_user_id uuid DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT gen_random_uuid(),
  position_name text,
  CONSTRAINT work_tracking_pkey PRIMARY KEY (id),
  CONSTRAINT work_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT work_tracking_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
CREATE TABLE public.families (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL,
  plan text NOT NULL,
  balance numeric NOT NULL,
  created_at date NOT NULL DEFAULT now(),
  tenant_id uuid NOT NULL,
  CONSTRAINT families_pkey PRIMARY KEY (id)
);
CREATE TABLE public.parents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL,
  firstname text NOT NULL,
  lastname text NOT NULL,
  date_of_birth date NOT NULL,
  personal_number text NOT NULL,
  is_active boolean NOT NULL,
  phone_number text NOT NULL,
  address text NOT NULL,
  created_at date NOT NULL DEFAULT now(),
  pick_up boolean NOT NULL,
  tenant_id uuid NOT NULL,
  CONSTRAINT parents_pkey PRIMARY KEY (id),
  CONSTRAINT parents_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id)
);
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  file_url text NOT NULL,
  created_at date NOT NULL DEFAULT now(),
  kid_id uuid,
  user_id uuid,
  family_id uuid,
  tenant_id uuid NOT NULL DEFAULT '8c0785e5-83cc-4fa3-9957-75ae61b50d37'::uuid,
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_kid_id_fkey FOREIGN KEY (kid_id) REFERENCES public.kids(id),
  CONSTRAINT documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT documents_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id)
);
CREATE TABLE public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  average_year text NOT NULL,
  location_id uuid NOT NULL,
  capacity numeric NOT NULL,
  lead_user_id uuid NOT NULL,
  assistant_user_id uuid NOT NULL,
  schedule json NOT NULL,
  starts_at date,
  ends_at date,
  CONSTRAINT classes_pkey PRIMARY KEY (id),
  CONSTRAINT classes_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id),
  CONSTRAINT classes_lead_user_id_fkey FOREIGN KEY (lead_user_id) REFERENCES public.users(id),
  CONSTRAINT classes_assistant_user_id_fkey FOREIGN KEY (assistant_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.waitlists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  kid_id uuid NOT NULL,
  class_id uuid NOT NULL,
  created_at date NOT NULL DEFAULT now(),
  tenant_id uuid NOT NULL,
  CONSTRAINT waitlists_pkey PRIMARY KEY (id),
  CONSTRAINT waitlists_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT waitlists_kid_id_fkey FOREIGN KEY (kid_id) REFERENCES public.kids(id)
);
CREATE TABLE public.kids (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL,
  firstname text NOT NULL,
  lastname text NOT NULL,
  date_of_birth date NOT NULL,
  personal_number text,
  gender text NOT NULL,
  created_at date NOT NULL DEFAULT now(),
  class_id uuid,
  tenant_id uuid NOT NULL,
  CONSTRAINT kids_pkey PRIMARY KEY (id),
  CONSTRAINT kids_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id),
  CONSTRAINT kids_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id)
);
CREATE TABLE public.billing (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  family_id uuid NOT NULL,
  amount numeric NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL,
  CONSTRAINT billing_pkey PRIMARY KEY (id),
  CONSTRAINT billing_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id)
);
CREATE TABLE public.activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  executor_id uuid NOT NULL,
  activity text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  tenant_id uuid NOT NULL,
  CONSTRAINT activities_pkey PRIMARY KEY (id),
  CONSTRAINT activities_executor_id_fkey FOREIGN KEY (executor_id) REFERENCES public.users(id)
);
CREATE TABLE public.kid_attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  kid_id uuid NOT NULL,
  class_id uuid NOT NULL,
  date date NOT NULL,
  check_in timestamp with time zone,
  check_out timestamp with time zone,
  checked_in_by uuid NOT NULL,
  checked_out_by uuid,
  check_out_to uuid,
  back_up_check_out_to text,
  pickup_note text,
  status text,
  absent_reason text,
  tenant_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT kid_attendance_pkey PRIMARY KEY (id),
  CONSTRAINT kid_attendance_kid_id_fkey FOREIGN KEY (kid_id) REFERENCES public.kids(id),
  CONSTRAINT kid_attendance_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT kid_attendance_checked_in_by_fkey FOREIGN KEY (checked_in_by) REFERENCES public.users(id),
  CONSTRAINT kid_attendance_checked_out_by_fkey FOREIGN KEY (checked_out_by) REFERENCES public.users(id),
  CONSTRAINT kid_attendance_check_out_to_fkey FOREIGN KEY (check_out_to) REFERENCES public.parents(id)
);
CREATE TABLE public.incidents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  kid_id uuid NOT NULL,
  reported_by uuid NOT NULL,
  incident_type text NOT NULL,
  description text NOT NULL,
  action_taken text,
  parent_notified boolean NOT NULL,
  notified_at timestamp with time zone NOT NULL,
  severity text NOT NULL,
  tenant_id uuid NOT NULL,
  created_at date NOT NULL DEFAULT now(),
  CONSTRAINT incidents_pkey PRIMARY KEY (id),
  CONSTRAINT incidents_kid_id_fkey FOREIGN KEY (kid_id) REFERENCES public.kids(id),
  CONSTRAINT incidents_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES public.users(id)
);
CREATE TABLE public.contract_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  body text NOT NULL,
  is_default boolean NOT NULL,
  is_active boolean NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL,
  CONSTRAINT contract_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  family_id uuid NOT NULL,
  kid_id uuid NOT NULL,
  template_id uuid NOT NULL,
  contract_number text NOT NULL,
  generated_pdf text NOT NULL,
  status text NOT NULL,
  valid_from date NOT NULL,
  valid_until date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT contracts_pkey PRIMARY KEY (id),
  CONSTRAINT contracts_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id),
  CONSTRAINT contracts_kid_id_fkey FOREIGN KEY (kid_id) REFERENCES public.kids(id),
  CONSTRAINT contracts_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.contract_templates(id)
);
CREATE TABLE public.class_checklist_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  category text NOT NULL,
  item_name text NOT NULL,
  is_mandatory boolean NOT NULL,
  applies_to text NOT NULL,
  sort_order numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT class_checklist_items_pkey PRIMARY KEY (id),
  CONSTRAINT class_checklist_items_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id)
);
CREATE TABLE public.family_checklist_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  kid_id uuid NOT NULL,
  checklist_item_id uuid NOT NULL,
  is_checked boolean NOT NULL,
  checked_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT family_checklist_progress_pkey PRIMARY KEY (id),
  CONSTRAINT family_checklist_progress_kid_id_fkey FOREIGN KEY (kid_id) REFERENCES public.kids(id),
  CONSTRAINT family_checklist_progress_checklist_item_id_fkey FOREIGN KEY (checklist_item_id) REFERENCES public.class_checklist_items(id)
);
CREATE TABLE public.tenant_legal_info (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  legal_entity_name text NOT NULL,
  country text NOT NULL,
  tax_id text NOT NULL,
  registration_number text NOT NULL,
  street text NOT NULL,
  city text NOT NULL,
  postal_code text NOT NULL,
  rep_name text NOT NULL,
  rep_title text NOT NULL,
  rep_email text NOT NULL,
  rep_phone text NOT NULL,
  updated_by uuid,
  updated_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tenant_legal_info_pkey PRIMARY KEY (id),
  CONSTRAINT tenant_legal_info_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.salary_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  salary numeric NOT NULL,
  is_active boolean NOT NULL,
  CONSTRAINT salary_tracking_pkey PRIMARY KEY (id),
  CONSTRAINT salary_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.class_hub_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  author_id uuid NOT NULL,
  post_type text NOT NULL,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT class_hub_posts_pkey PRIMARY KEY (id),
  CONSTRAINT class_hub_posts_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT class_hub_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id)
);
CREATE TABLE public.class_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  rule_text text NOT NULL,
  sort_order numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT class_rules_pkey PRIMARY KEY (id),
  CONSTRAINT class_rules_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id)
);
CREATE TABLE public.class_curriculum (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  period_type text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  title text,
  theme text,
  status text NOT NULL DEFAULT 'draft'::text,
  created_by uuid NOT NULL,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT class_curriculum_pkey PRIMARY KEY (id),
  CONSTRAINT class_curriculum_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT class_curriculum_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT class_curriculum_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);
CREATE TABLE public.class_curriculum_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  curriculum_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  specific_date date,
  day_of_week text,
  activity_name text NOT NULL,
  description text,
  learning_domain text,
  materials_needed text,
  sort_order numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT class_curriculum_items_pkey PRIMARY KEY (id),
  CONSTRAINT class_curriculum_items_curriculum_id_fkey FOREIGN KEY (curriculum_id) REFERENCES public.class_curriculum(id)
);
CREATE TABLE public.class_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  title text NOT NULL,
  location text,
  starts_at timestamp with time zone NOT NULL,
  ends_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT class_events_pkey PRIMARY KEY (id),
  CONSTRAINT class_events_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id)
);
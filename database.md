## Table `users`

Data table of user, that we register information, role and other properties

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary Unique |
| `name` | `varchar` |  |
| `lastname` | `varchar` |  |
| `phone_number` | `text` |  |
| `personal_number` | `text` |  |
| `role` | `varchar` |  |
| `created_at` | `date` |  |
| `is_active` | `bool` |  |
| `date_of_birth` | `date` |  |
| `tenant_id` | `uuid` |  |
| `password_hash` | `text` |  |
| `is_first_login_executed` | `bool` |  |
| `email` | `text` |  Unique |

## Table `tenants`

Data table of tenant, that a client is registered

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `slug` | `text` |  Unique |
| `created_at` | `date` |  |

## Table `subscription_plans`

Data table of subscription plans

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `code` | `text` |  Unique |
| `Name` | `text` |  |
| `yearly_price` | `numeric` |  |
| `is_active` | `bool` |  Nullable |

## Table `tenant_subscriptions`

Data table of tenant who is subscribe in platform

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `plan_id` | `uuid` |  |
| `status` | `subscription_status` |  |
| `starts_at` | `date` |  |
| `ends_at` | `date` |  |
| `price_at_purchase` | `numeric` |  |
| `auto_renew` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `departments`

Data table of departments in platform, based on Tenant Id

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `varchar` |  |
| `is_active` | `bool` |  |
| `tenant_id` | `uuid` |  |
| `location_id` | `uuid` |  Nullable |

## Table `locations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `name` | `varchar` |  |
| `street` | `varchar` |  |
| `house_number` | `varchar` |  Nullable |
| `postal_code` | `varchar` |  Nullable |
| `city` | `varchar` |  |
| `country` | `varchar` |  |

## Table `work_tracking`

Data table of work tracking for an user

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `department_id` | `uuid` |  Nullable |
| `start_date` | `date` |  |
| `end_date` | `date` |  Nullable |
| `responsible_user_id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  |
| `position_name` | `text` |  Nullable |

## Table `families`

Data table of families

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `status` | `text` |  |
| `plan` | `text` |  |
| `balance` | `numeric` |  |
| `created_at` | `date` |  |
| `tenant_id` | `uuid` |  |

## Table `parents`

Data table of parents

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `family_id` | `uuid` |  |
| `firstname` | `text` |  |
| `lastname` | `text` |  |
| `date_of_birth` | `date` |  |
| `personal_number` | `text` |  |
| `is_active` | `bool` |  |
| `phone_number` | `text` |  |
| `address` | `text` |  |
| `created_at` | `date` |  |
| `pick_up` | `bool` |  |
| `tenant_id` | `uuid` |  |

## Table `documents`

Data table of documents per kids

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `file_url` | `text` |  |
| `created_at` | `date` |  |
| `kid_id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `family_id` | `uuid` |  Nullable |
| `tenant_id` | `uuid` |  |
| `class_curriculum_id` | `uuid` |  Nullable |
| `class_id` | `uuid` |  Nullable |

## Table `classes`

Data table of classes that are kids registered to

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `average_year` | `text` |  |
| `location_id` | `uuid` |  |
| `capacity` | `numeric` |  |
| `lead_user_id` | `uuid` |  |
| `assistant_user_id` | `uuid` |  |
| `schedule` | `json` |  |
| `starts_at` | `date` |  Nullable |
| `ends_at` | `date` |  Nullable |

## Table `waitlists`

Data table of waitlist classes

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `kid_id` | `uuid` |  |
| `class_id` | `uuid` |  |
| `created_at` | `date` |  |
| `tenant_id` | `uuid` |  |

## Table `kids`

Data table of kids per family

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `family_id` | `uuid` |  |
| `firstname` | `text` |  |
| `lastname` | `text` |  |
| `date_of_birth` | `date` |  |
| `personal_number` | `text` |  Nullable |
| `gender` | `text` |  |
| `created_at` | `date` |  |
| `class_id` | `uuid` |  Nullable |
| `tenant_id` | `uuid` |  |

## Table `billing`

Data table of billings per family

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `invoice_number` | `text` |  Unique |
| `family_id` | `uuid` |  |
| `amount` | `numeric` |  |
| `due_date` | `date` |  |
| `status` | `text` |  |

## Table `activities`

Data table of activities

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `executor_id` | `uuid` |  |
| `activity` | `text` |  |
| `created_at` | `timestamptz` |  |
| `tenant_id` | `uuid` |  |

## Table `kid_attendance`

Data table of kid attendance

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `kid_id` | `uuid` |  |
| `class_id` | `uuid` |  |
| `date` | `date` |  |
| `check_in` | `timestamptz` |  Nullable |
| `check_out` | `timestamptz` |  Nullable |
| `checked_in_by` | `uuid` |  |
| `checked_out_by` | `uuid` |  Nullable |
| `check_out_to` | `uuid` |  Nullable |
| `back_up_check_out_to` | `text` |  Nullable |
| `pickup_note` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `absent_reason` | `text` |  Nullable |
| `tenant_id` | `uuid` |  |
| `created_at` | `timestamptz` |  |

## Table `incidents`

Data table that has incidents registered

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `kid_id` | `uuid` |  |
| `reported_by` | `uuid` |  |
| `incident_type` | `text` |  |
| `description` | `text` |  |
| `action_taken` | `text` |  Nullable |
| `parent_notified` | `bool` |  |
| `notified_at` | `timestamptz` |  |
| `severity` | `text` |  |
| `tenant_id` | `uuid` |  |
| `created_at` | `date` |  |

## Table `contract_templates`

Data table of contract_templates

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `name` | `text` |  |
| `type` | `text` |  |
| `body` | `text` |  |
| `is_default` | `bool` |  |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `contracts`

Data table of contracts

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `family_id` | `uuid` |  |
| `kid_id` | `uuid` |  |
| `template_id` | `uuid` |  |
| `contract_number` | `text` |  |
| `generated_pdf` | `text` |  |
| `status` | `text` |  |
| `valid_from` | `date` |  |
| `valid_until` | `date` |  |
| `created_at` | `timestamptz` |  |

## Table `class_checklist_items`

Data table of checklist items for kids

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `class_id` | `uuid` |  |
| `tenant_id` | `uuid` |  |
| `category` | `text` |  |
| `item_name` | `text` |  |
| `is_mandatory` | `bool` |  |
| `applies_to` | `text` |  |
| `sort_order` | `numeric` |  |
| `created_at` | `timestamptz` |  |

## Table `family_checklist_progress`

Data table of family checklist for class progress

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `kid_id` | `uuid` |  |
| `checklist_item_id` | `uuid` |  |
| `is_checked` | `bool` |  |
| `checked_at` | `timestamptz` |  |

## Table `tenant_legal_info`

Data table of tenant legal information

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `legal_entity_name` | `text` |  |
| `country` | `text` |  |
| `tax_id` | `text` |  |
| `registration_number` | `text` |  |
| `street` | `text` |  |
| `city` | `text` |  |
| `postal_code` | `text` |  |
| `rep_name` | `text` |  |
| `rep_title` | `text` |  |
| `rep_email` | `text` |  |
| `rep_phone` | `text` |  |
| `updated_by` | `uuid` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `salary_tracking`

Data table of salary tracking per user

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `date` | `date` |  |
| `salary` | `numeric` |  |
| `is_active` | `bool` |  |
| `currency_id` | `uuid` |  |

## Table `class_hub_posts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `class_id` | `uuid` |  |
| `tenant_id` | `uuid` |  |
| `author_id` | `uuid` |  |
| `post_type` | `text` |  |
| `body` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `class_rules`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `class_id` | `uuid` |  |
| `tenant_id` | `uuid` |  |
| `rule_text` | `text` |  |
| `sort_order` | `numeric` |  |
| `created_at` | `timestamptz` |  |

## Table `class_events`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `class_id` | `uuid` |  |
| `tenant_id` | `uuid` |  |
| `title` | `text` |  |
| `location` | `text` |  Nullable |
| `starts_at` | `timestamptz` |  |
| `ends_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `class_curriculum`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `class_id` | `uuid` |  |
| `tenant_id` | `uuid` |  |
| `period_type` | `text` |  |
| `period_start` | `date` |  |
| `period_end` | `date` |  |
| `title` | `text` |  Nullable |
| `theme` | `text` |  Nullable |
| `status` | `text` |  |
| `created_by` | `uuid` |  |
| `updated_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  Nullable |

## Table `class_curriculum_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `curriculum_id` | `uuid` |  |
| `tenant_id` | `uuid` |  |
| `specific_date` | `date` |  Nullable |
| `day_of_week` | `text` |  Nullable |
| `activity_name` | `text` |  |
| `description` | `text` |  Nullable |
| `learning_domain` | `text` |  Nullable |
| `materials_needed` | `text` |  Nullable |
| `sort_order` | `numeric` |  |
| `created_at` | `timestamptz` |  |

## Table `currency`

Data table of currency per tenant

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `currency` | `text` |  |
| `symbol` | `text` |  |
| `tenant_id` | `uuid` |  |

## Table `address`

Data table of address per employee

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `street` | `text` |  Nullable |
| `house_number` | `text` |  Nullable |
| `city` | `text` |  Nullable |
| `postal_code` | `text` |  Nullable |
| `country` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `user_id` | `uuid` |  Nullable |

## Table `user_profiles`

Data table of user profiles

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `file_url` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `food_supplies`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `location_id` | `uuid` |  |
| `vendor_name` | `text` |  Nullable |
| `purchase_date` | `date` |  |
| `total_cost` | `numeric` |  |
| `receipt_storage_path` | `text` |  Nullable |
| `created_by` | `uuid` |  |
| `created_at` | `timestamptz` |  |

## Table `food_supply_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `supply_id` | `uuid` |  |
| `item_name` | `text` |  |
| `quantity` | `numeric` |  Nullable |
| `unit` | `text` |  Nullable |
| `unit_cost` | `numeric` |  Nullable |
| `line_total` | `numeric` |  |

## Table `class_menus`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `class_id` | `uuid` |  |
| `date` | `date` |  |
| `meal_type` | `text` |  |
| `description` | `text` |  |
| `created_by` | `uuid` |  |
| `created_at` | `timestamptz` |  |


-- Database Schema for Business Management System

-- Employees table with hierarchy
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('CEO', 'Manager', 'Instructor', 'Receptionist')),
    manager_id INTEGER REFERENCES employees(id),
    personal_info JSONB, -- Store additional personal information
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contracts table for contract history
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    details JSONB, -- Contract details
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Salaries table for compensation history
CREATE TABLE salaries (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    effective_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    documents JSONB, -- Store client documents/information
    registered_by INTEGER NOT NULL REFERENCES employees(id), -- Receptionist who registered
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parents table
CREATE TABLE parents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Children table
CREATE TABLE children (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instructor groups table
CREATE TABLE instructor_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    instructor_id INTEGER NOT NULL REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group memberships (children in groups)
CREATE TABLE group_memberships (
    id SERIAL PRIMARY KEY,
    child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES instructor_groups(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(child_id, group_id) -- Prevent duplicate memberships
);

-- Schedules table (for both instructors and children)
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('instructor', 'child')),
    entity_id INTEGER NOT NULL, -- References employees.id or children.id based on type
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    schedule_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Add check constraints or triggers to ensure entity_id exists in correct table
    CHECK (
        (type = 'instructor' AND EXISTS (SELECT 1 FROM employees WHERE id = entity_id)) OR
        (type = 'child' AND EXISTS (SELECT 1 FROM children WHERE id = entity_id))
    )
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    recipient_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(100) NOT NULL, -- e.g., 'new_child_registered'
    related_id INTEGER, -- Could reference group_memberships.id or other relevant IDs
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_contracts_employee ON contracts(employee_id);
CREATE INDEX idx_salaries_employee ON salaries(employee_id);
CREATE INDEX idx_clients_registered_by ON clients(registered_by);
CREATE INDEX idx_children_parent ON children(parent_id);
CREATE INDEX idx_instructor_groups_instructor ON instructor_groups(instructor_id);
CREATE INDEX idx_group_memberships_child ON group_memberships(child_id);
CREATE INDEX idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX idx_schedules_entity ON schedules(entity_id, type);
CREATE INDEX idx_schedules_date ON schedules(schedule_date);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create notification when child is registered to a group
CREATE OR REPLACE FUNCTION notify_instructor_new_child()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (recipient_id, message, type, related_id)
    SELECT ig.instructor_id,
           'New child ' || c.name || ' has been registered to your group ' || ig.name,
           'new_child_registered',
           NEW.id
    FROM instructor_groups ig
    JOIN children c ON c.id = NEW.child_id
    WHERE ig.id = NEW.group_id;

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_notify_new_child AFTER INSERT ON group_memberships FOR EACH ROW EXECUTE FUNCTION notify_instructor_new_child();
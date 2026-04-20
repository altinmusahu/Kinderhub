import { Pool } from 'pg';

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  manager_id?: number;
  personal_info?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getUsers(): Promise<User[]> {
  const result = await pool.query('SELECT * FROM employees ORDER BY created_at DESC');
  return result.rows;
}

export async function addUser(user: Omit<User, "id" | "created_at" | "updated_at">): Promise<User> {
  const { name, email, role, manager_id, personal_info } = user;
  const result = await pool.query(
    'INSERT INTO employees (name, email, role, manager_id, personal_info) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, email, role, manager_id, personal_info]
  );
  return result.rows[0];
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function updateUser(id: number, updates: Partial<Omit<User, "id" | "created_at" | "updated_at">>): Promise<User | null> {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
  const query = `UPDATE employees SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, [id, ...values]);
  return result.rows[0] || null;
}

export async function deleteUser(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM employees WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export function getHealth() {
  return {
    status: "ok",
    time: new Date().toISOString(),
    uptime: process.uptime(),
  };
}

process.on('SIGINT', () => {
  pool.end();
});

process.on('SIGTERM', () => {
  pool.end();
});

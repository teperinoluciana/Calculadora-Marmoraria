import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'leads.db'));

// Initialize the database with the leads table
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

try {
  db.exec('ALTER TABLE leads ADD COLUMN marmoraria_interest INTEGER DEFAULT 0');
} catch (e) {
  // Column already exists
}

export interface Lead {
  id?: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  marmoraria_interest?: number;
  created_at?: string;
}

export function addLead(lead: Lead) {
  const stmt = db.prepare('INSERT INTO leads (name, email, phone, role, marmoraria_interest) VALUES (@name, @email, @phone, @role, @marmoraria_interest) ON CONFLICT(email) DO UPDATE SET name=excluded.name, phone=excluded.phone, role=excluded.role, marmoraria_interest=excluded.marmoraria_interest');
  return stmt.run({ ...lead, marmoraria_interest: lead.marmoraria_interest ? 1 : 0 });
}

export function getLeads(): Lead[] {
  const stmt = db.prepare('SELECT * FROM leads ORDER BY created_at DESC');
  return stmt.all() as Lead[];
}

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new Database(dbPath);

const initDb = () => {
    // Create Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password_hash TEXT,
            role TEXT DEFAULT 'user',
            daily_goal INTEGER DEFAULT 4,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create Schedules table
    db.exec(`
        CREATE TABLE IF NOT EXISTS schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            week_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Create Sessions table (for logging completed work)
    db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            subject TEXT,
            topic TEXT,
            duration INTEGER,
            completed BOOLEAN DEFAULT 0,
            date TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Create Settings table
    db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            user_id INTEGER PRIMARY KEY,
            dark_mode BOOLEAN DEFAULT 1,
            notifications BOOLEAN DEFAULT 1,
            gemini_key TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Check if admin exists, if not create a default one
    const admin = db.prepare('SELECT * FROM users WHERE role = ?').get('admin');
    if (!admin) {
        const hash = bcrypt.hashSync('admin123', 10);
        db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
            'Admin', 'admin@studyai.com', hash, 'admin'
        );
        console.log('Default admin created: admin@studyai.com / admin123');
    }
};

export { db, initDb };

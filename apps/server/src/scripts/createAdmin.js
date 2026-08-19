import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'swapstore',
    port: process.env.DB_PORT || 3306
  });

  const username = 'admin';
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);

  try {
    // Check if exists first to update, or insert
    const [rows] = await connection.query('SELECT id FROM admins WHERE username = ?', [username]);
    if (rows.length > 0) {
      await connection.query('UPDATE admins SET password_hash = ? WHERE username = ?', [hash, username]);
      console.log('Admin user updated successfully! Username: admin, Password: admin123');
    } else {
      await connection.query('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [username, hash]);
      console.log('Admin user created successfully! Username: admin, Password: admin123');
    }
  } catch (err) {
    console.error('Error creating/updating admin user:', err);
  }

  await connection.end();
}

createAdmin();

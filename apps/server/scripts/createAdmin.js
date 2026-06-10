import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'swapstore',
    port: process.env.DB_PORT || 3306
  });

  const username = 'admin';
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);

  try {
    await connection.query('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [username, hash]);
    console.log('Admin user created successfully! Username: admin, Password: password123');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('Admin user already exists.');
    } else {
      console.error('Error creating admin user:', err);
    }
  }

  await connection.end();
}

createAdmin();

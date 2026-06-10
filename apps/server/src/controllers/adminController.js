import { queryRunner } from '../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import env from '../config/env.js';

export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const rows = await queryRunner('SELECT * FROM admins WHERE username = ? LIMIT 1', [username]);

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = rows[0];
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      env.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error in adminLogin:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

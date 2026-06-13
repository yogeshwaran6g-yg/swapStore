import { queryRunner } from '../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import env from '../config/env.js';
import { rtnRes } from '../utils/responseUtils.js';

export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return rtnRes(res, 400, 'Username and password are required');
    }

    const rows = await queryRunner('SELECT * FROM admins WHERE username = ? LIMIT 1', [username]);

    if (!rows || rows.length === 0) {
      return rtnRes(res, 401, 'Invalid credentials');
    }

    const admin = rows[0];
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return rtnRes(res, 401, 'Invalid credentials');
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      env.jwtSecret,
      { expiresIn: '24h' }
    );

    return rtnRes(res, 200, 'Login successful', { 
      token, 
      admin: { id: admin.id, username: admin.username, role: 'admin' } 
    });
  } catch (error) {
    console.error('Error in adminLogin:', error);
    return rtnRes(res, 500, 'Internal Server Error');
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    // req.user is populated by authMiddleware
    return rtnRes(res, 200, 'Profile fetched', { admin: req.user });
  } catch (error) {
    console.error('Error in getAdminProfile:', error);
    return rtnRes(res, 500, 'Internal Server Error');
  }
};

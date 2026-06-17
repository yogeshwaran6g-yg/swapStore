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

export const getAllSettings = async (req, res) => {
  try {
    const rows = await queryRunner('SELECT setting_key, setting_value FROM system_settings');
    const settings = rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});
    return rtnRes(res, 200, 'Settings fetched successfully', { settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return rtnRes(res, 500, 'Internal Server Error');
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return rtnRes(res, 400, 'Invalid settings data');
    }

    // Update settings one by one
    for (const [key, value] of Object.entries(settings)) {
      // Basic validation: setting value string
      const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      await queryRunner(
        'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, strValue, strValue]
      );
    }

    return rtnRes(res, 200, 'Settings updated successfully');
  } catch (error) {
    console.error('Error updating settings:', error);
    return rtnRes(res, 500, 'Internal Server Error');
  }
};

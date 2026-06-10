import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const adminAuth = (req, res, next) => {
  // Bypassing login for now
  req.user = { role: 'admin', id: 1 };
  next();
};

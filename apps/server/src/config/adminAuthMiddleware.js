import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Admin Auth Error:', error.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

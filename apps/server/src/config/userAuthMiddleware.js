import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Middleware to verify user JWT tokens.
 * Sets req.user with { uid, wallet_address } from the decoded token.
 */
export const userAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    req.user = decoded; // { uid, wallet_address }
    next();
  } catch (error) {
    console.error('User Auth Error:', error.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

import jwt from 'jsonwebtoken';
import env from './env.js';

/**
 * Universal Auth Middleware
 * Decodes the JWT token and deduces the role based on payload keys.
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token || token === 'null' || token === 'undefined') {
      console.log("token not found")
      return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
    }

    const decoded = jwt.verify(token, env.jwtSecret);

    // Deduce role based on unique keys
    // Admin payload has `id`, user payload has `uid`
    console.log("decoded", decoded)
    if (decoded.id) {
      req.user = { ...decoded, role: 'admin' };
    } else if (decoded.uid) {
      req.user = { ...decoded, role: 'user' };
    } else {
      // Fallback if neither exists
      req.user = { ...decoded, role: decoded.role || 'user' };
    }

    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

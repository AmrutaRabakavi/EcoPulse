import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET;
      
      if (!secret) {
        return res.status(500).json({
          success: false,
          message: 'Server configuration error: JWT_SECRET missing',
        });
      }

      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id).select('-passwordHash');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized: User account no longer exists',
        });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Invalid or expired token',
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No Bearer token provided',
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required',
    });
  }
  next();
};

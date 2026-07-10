import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { ErrorResponse } from './errorMiddleware.js';

/**
 * Protect routes - ensures that a valid access token is supplied in the request authorization header.
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for JWT token in HTTP headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Ensure token exists
  if (!token) {
    return next(
      new ErrorResponse('Not authorized to access this route. Token missing.', 401)
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database, excluding password, and attach to request object
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse('No user found with this token context.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorResponse('Not authorized to access this route. Token invalid.', 401));
  }
};

/**
 * Grant access to specific roles (e.g. admin)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('User context is not authenticated.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user.role}' is not authorized to access this action`,
          403
        )
      );
    }
    next();
  };
};

/**
 * Require active verified email before accessing features
 */
export const requireVerified = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse('User context is not authenticated.', 401));
  }

  if (!req.user.isVerified) {
    return next(
      new ErrorResponse(
        'Please verify your email address to unlock this feature.',
        403
      )
    );
  }
  next();
};

/**
 * Optional protection - extracts user context if a valid access token is present, but doesn't block the request if none is provided.
 */
export const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    // Pass along without user context if verification fails (token expired/invalid)
    next();
  }
};

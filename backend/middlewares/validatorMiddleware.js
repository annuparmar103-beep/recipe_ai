import { validationResult } from 'express-validator';
import { ErrorResponse } from './errorMiddleware.js';

/**
 * Common validation runner middleware.
 * Triggers if any express-validator chain detects invalid inputs.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors
      .array()
      .map((err) => `${err.path}: ${err.msg}`)
      .join(', ');
    return next(new ErrorResponse(`Validation Failed: [${errorDetails}]`, 400));
  }
  next();
};

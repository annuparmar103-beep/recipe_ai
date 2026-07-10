/**
 * Custom Error Response class to capture HTTP status codes and custom error details.
 */
export class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global centralized error handler middleware.
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Details]:', err);
  }

  // Mongoose Bad ObjectID (Cast Error)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for ${field} field. Please choose another value.`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Not authorized to access this route. Invalid token.';
    error = new ErrorResponse(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Session expired. Please log in again.';
    error = new ErrorResponse(message, 401);
  }

  // General fallback
  const statusCode = error.statusCode || 500;
  const responseMessage = error.message || 'Server Error. Something went wrong.';

  res.status(statusCode).json({
    success: false,
    message: responseMessage,
    // Stack trace is only visible in development for security
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

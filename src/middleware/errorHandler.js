/**
 * Error Handler Middleware
 *
 * Centralized error handling for the application.
 * Follows Single Responsibility Principle.
 */

/**
 * Error handler middleware
 * Catches and formats errors for client response
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).send({
    error: {
      message,
      status: statusCode,
    },
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).send('Not Found');
};

/**
 * Async route handler wrapper
 * Catches async errors and passes to error handler
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};

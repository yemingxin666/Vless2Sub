/**
 * Authentication Middleware
 *
 * Validates access tokens for protected routes.
 * Follows Single Responsibility Principle.
 */

import config from '../config/index.js';

/**
 * Check if path matches any valid token
 * @param {string} pathname - Request pathname
 * @param {string[]} tokens - Valid tokens
 * @returns {boolean} True if path is valid
 */
const isValidTokenPath = (pathname, tokens) => {
  return tokens.some(token =>
    pathname === `/${token}` || pathname.startsWith(`/${token}/`)
  );
};

/**
 * Authentication middleware
 * Validates that the request path contains a valid token
 */
export const authenticate = (req, res, next) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const tokens = config.auth.tokens;

  // Check if path contains valid token
  if (!isValidTokenPath(pathname, tokens)) {
    return res.status(404).send('Not Found');
  }

  // Store token info in request for later use
  req.validToken = tokens.find(token =>
    pathname === `/${token}` || pathname.startsWith(`/${token}/`)
  );

  next();
};

/**
 * Check if request is for token root path (UI page)
 * @param {string} pathname - Request pathname
 * @param {string[]} tokens - Valid tokens
 * @returns {boolean} True if token root path
 */
export const isTokenRootPath = (pathname, tokens) => {
  return tokens.some(token => pathname === `/${token}`);
};

export default {
  authenticate,
  isTokenRootPath,
};

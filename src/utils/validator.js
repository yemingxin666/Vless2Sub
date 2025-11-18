/**
 * Validator Utilities
 *
 * Provides validation functions for various inputs.
 * Follows Single Responsibility Principle.
 */

/**
 * Validate UUID format
 * @param {string} uuid - UUID string to validate
 * @returns {boolean} True if valid UUID format
 */
export const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate hostname format
 * @param {string} hostname - Hostname to validate
 * @returns {boolean} True if valid hostname
 */
export const isValidHostname = (hostname) => {
  const hostnameRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return hostnameRegex.test(hostname);
};

/**
 * Validate port number
 * @param {string|number} port - Port to validate
 * @returns {boolean} True if valid port (1-65535)
 */
export const isValidPort = (port) => {
  const portNum = parseInt(port, 10);
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate path format (must start with /)
 * @param {string} path - Path to validate
 * @returns {boolean} True if valid path
 */
export const isValidPath = (path) => {
  return typeof path === 'string' && path.startsWith('/');
};

/**
 * Validate protocol type
 * @param {string} protocol - Protocol to validate
 * @returns {boolean} True if valid protocol (VLESS, VMess, Trojan)
 */
export const isValidProtocol = (protocol) => {
  const validProtocols = ['VLESS', 'VMess', 'Trojan'];
  return validProtocols.includes(protocol);
};

/**
 * Validate subscription format
 * @param {string} format - Format to validate
 * @returns {boolean} True if valid format
 */
export const isValidSubscriptionFormat = (format) => {
  const validFormats = ['clash', 'singbox', 'surge', 'base64'];
  return validFormats.includes(format.toLowerCase());
};

/**
 * Sanitize user input to prevent injection attacks
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate and sanitize query parameters
 * @param {Object} params - Query parameters object
 * @param {string[]} allowedKeys - List of allowed parameter keys
 * @returns {Object} Validated and sanitized parameters
 */
export const validateQueryParams = (params, allowedKeys) => {
  const validated = {};

  for (const key of allowedKeys) {
    if (params[key] !== undefined) {
      validated[key] = sanitizeInput(params[key]);
    }
  }

  return validated;
};

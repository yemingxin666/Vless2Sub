/**
 * Cryptography Utilities
 *
 * Provides encryption and hashing functions.
 * Replaces Cloudflare Workers' crypto.subtle with Node.js crypto module.
 */

import crypto from 'crypto';

/**
 * Double MD5 hash (MD5 of MD5)
 * @param {string} text - Text to hash
 * @returns {string} Double MD5 hash in lowercase hex
 */
export const MD5MD5 = (text) => {
  // First MD5 pass
  const firstHash = crypto.createHash('md5').update(text).digest('hex');

  // Second MD5 pass on substring
  const substring = firstHash.slice(7, 27);
  const secondHash = crypto.createHash('md5').update(substring).digest('hex');

  return secondHash.toLowerCase();
};

/**
 * Generate UUID from base string using SHA-256
 * @param {string} baseString - Base string for UUID generation
 * @returns {string} UUID in standard format
 */
export const generateUUID = (baseString) => {
  const hash = crypto.createHash('sha256').update(baseString).digest('hex');

  // Format as UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return `${hash.substr(0, 8)}-${hash.substr(8, 4)}-4${hash.substr(13, 3)}-${(parseInt(hash.substr(16, 2), 16) & 0x3f | 0x80).toString(16)}${hash.substr(18, 2)}-${hash.substr(20, 12)}`;
};

/**
 * Generate dynamic UUID based on time period
 * @param {string} key - Secret key for UUID generation
 * @param {number} validDays - Valid period in days (default: 7)
 * @param {number} updateHour - Update hour in UTC+8 (default: 3)
 * @returns {Object} Object containing current UUID, previous UUID, and expiry time
 */
export const generateDynamicUUID = (key, validDays = 7, updateHour = 3) => {
  const timezoneOffset = 8; // UTC+8 for Beijing time
  const startDate = new Date(2007, 6, 7, updateHour, 0, 0); // July 7, 2007
  const periodMs = 1000 * 60 * 60 * 24 * validDays;

  // Calculate current period number
  const now = new Date();
  const adjustedNow = new Date(now.getTime() + timezoneOffset * 60 * 60 * 1000);
  const timeDiff = adjustedNow.getTime() - startDate.getTime();
  const currentPeriod = Math.ceil(timeDiff / periodMs);

  // Generate UUIDs
  const currentUUID = generateUUID(key + currentPeriod);
  const previousUUID = generateUUID(key + (currentPeriod - 1));

  // Calculate expiry time
  const expiryTime = new Date(startDate.getTime() + currentPeriod * periodMs);
  const expiryTimeUTC = new Date(expiryTime.getTime() - timezoneOffset * 60 * 60 * 1000);

  return {
    currentUUID,
    previousUUID,
    expiryTime: expiryTime.toISOString().slice(0, 19).replace('T', ' '),
    expiryTimeUTC: expiryTimeUTC.toISOString().slice(0, 19).replace('T', ' '),
  };
};

/**
 * Base64 encode UTF-8 string
 * @param {string} str - String to encode
 * @returns {string} Base64 encoded string
 */
export const utf8ToBase64 = (str) => {
  return Buffer.from(str, 'utf-8').toString('base64');
};

/**
 * Base64 decode to UTF-8 string
 * @param {string} str - Base64 string to decode
 * @returns {string} Decoded UTF-8 string
 */
export const base64ToUtf8 = (str) => {
  return Buffer.from(str, 'base64').toString('utf-8');
};

/**
 * Generate fake UUID for obfuscation
 * @returns {string} Fake UUID based on current timestamp
 */
export const generateFakeUUID = () => {
  const currentDate = new Date();
  const fakeUserIDMD5 = MD5MD5(Math.ceil(currentDate.getTime()).toString());

  return `${fakeUserIDMD5.slice(0, 8)}-${fakeUserIDMD5.slice(8, 12)}-${fakeUserIDMD5.slice(12, 16)}-${fakeUserIDMD5.slice(16, 20)}-${fakeUserIDMD5.slice(20)}`;
};

/**
 * Generate fake hostname for obfuscation
 * @returns {string} Fake hostname
 */
export const generateFakeHostname = () => {
  const currentDate = new Date();
  const fakeUserIDMD5 = MD5MD5(Math.ceil(currentDate.getTime()).toString());

  return `${fakeUserIDMD5.slice(6, 9)}.${fakeUserIDMD5.slice(13, 19)}.xyz`;
};

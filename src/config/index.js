/**
 * Configuration Management Module
 *
 * Centralizes all application configuration with validation and defaults.
 * Follows Single Responsibility Principle (SRP) - only handles configuration.
 */

import dotenv from 'dotenv';

dotenv.config();

/**
 * Parse comma-separated string into array
 * @param {string} value - Comma-separated string
 * @returns {string[]} Array of trimmed values
 */
const parseArray = (value) => {
  if (!value) return [];
  return value.split(',').map(item => item.trim()).filter(Boolean);
};

/**
 * Get environment variable with default value
 * @param {string} key - Environment variable key
 * @param {*} defaultValue - Default value if not set
 * @returns {*} Environment variable value or default
 */
const getEnv = (key, defaultValue = '') => {
  return process.env[key] || defaultValue;
};

/**
 * Application Configuration Object
 * All configuration is centralized here for easy maintenance
 */
const config = {
  // Server Configuration
  server: {
    port: parseInt(getEnv('PORT', '3000'), 10),
    env: getEnv('NODE_ENV', 'development'),
  },

  // Access Control
  auth: {
    tokens: parseArray(getEnv('TOKEN', 'auto')),
  },

  // Host Configuration
  host: {
    domain: getEnv('HOST', 'null'),
    uuid: getEnv('UUID', 'null'),
    password: getEnv('PASSWORD', ''),
    path: getEnv('PATH', '/?ed=2560'),
    sni: getEnv('SNI', ''),
    type: getEnv('TYPE', 'ws'),
  },

  // Subscription Configuration
  subscription: {
    name: getEnv('SUBNAME', '优选订阅生成器'),
    api: getEnv('SUBAPI', 'SUBAPI.cmliussss.net'),
    config: getEnv('SUBCONFIG', 'aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2NtbGl1L0FDTDRTU1IvbWFpbi9DbGFzaC9jb25maWcvQUNMNFNTUl9PbmxpbmVfRnVsbF9NdWx0aU1vZGUuaW5p'),
    protocol: getEnv('SUBAPI', '').includes('http://') ? 'http' : 'https',
    updateTime: 6, // hours
  },

  // IP Addresses
  addresses: {
    tls: parseArray(getEnv('ADD', '')),
    tlsApi: parseArray(getEnv('ADDAPI', '')),
    noTls: parseArray(getEnv('ADDNOTLS', '')),
    noTlsApi: parseArray(getEnv('ADDNOTLSAPI', '')),
    csv: parseArray(getEnv('ADDCSV', '')),
  },

  // Proxy Configuration
  proxy: {
    ips: parseArray(getEnv('PROXYIP', 'proxyip.fxxk.dedyn.io')),
    ipsApi: parseArray(getEnv('PROXYIPAPI', '')),
    matchIps: parseArray(getEnv('CMPROXYIPS', '')),
    enableRemote: getEnv('RPROXYIP', 'false'),
  },

  // Advanced Settings
  advanced: {
    cfPorts: parseArray(getEnv('CFPORTS', '2053,2083,2087,2096,8443')),
    dls: parseInt(getEnv('DLS', '7'), 10),
    csvRemarkIndex: parseInt(getEnv('CSVREMARK', '1'), 10),
    noTls: getEnv('NOTLS', 'false'),
    scv: getEnv('SCV', 'false'),
    alpn: getEnv('ALPN', ''),
    encryption: getEnv('ENCRYPTION', ''),
  },

  // UI Customization
  ui: {
    icon: getEnv('ICO', ''),
    avatar: getEnv('PNG', ''),
    backgrounds: parseArray(getEnv('IMG', '')),
    beian: getEnv('BEIAN', getEnv('BY', '')),
  },

  // Other Settings
  other: {
    ps: getEnv('PS', ''),
    ed: getEnv('ED', 'ed'),
    validTime: parseInt(getEnv('TIME', '7'), 10),
    updateTime: parseInt(getEnv('UPTIME', '3'), 10),
    key: getEnv('KEY', ''),
    link: getEnv('LINK', ''),
    url: getEnv('URL', ''),
    url302: getEnv('URL302', ''),
    socks5DataUrl: getEnv('SOCKS5DATA', ''),
  },

  // Constants
  constants: {
    total: 24 * 1099511627776,
    timestamp: 4102329600000,
    httpsPorts: ['2053', '2083', '2087', '2096', '8443'],
    httpPorts: ['8080', '8880', '2052', '2082', '2086', '2095'],
    userAgentBlacklist: ['telegram', 'twitter', 'miaoko'],
  },
};

/**
 * Validate required configuration
 * @throws {Error} If required configuration is missing
 */
export const validateConfig = () => {
  const errors = [];

  // Validate server port
  if (isNaN(config.server.port) || config.server.port < 1 || config.server.port > 65535) {
    errors.push('Invalid PORT: must be between 1 and 65535');
  }

  // Validate tokens
  if (config.auth.tokens.length === 0) {
    errors.push('TOKEN is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
};

export default config;

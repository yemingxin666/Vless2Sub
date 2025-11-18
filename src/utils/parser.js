/**
 * Parser Utilities
 *
 * Provides parsing functions for various data formats.
 * Follows DRY principle - reusable parsing logic.
 */

/**
 * Parse content into array by splitting on various delimiters
 * Replaces tabs, quotes, and newlines with commas, then splits
 *
 * @param {string} content - Content to parse
 * @returns {string[]} Array of parsed items
 */
export const parseContent = (content) => {
  if (!content) return [];

  // Replace tabs, quotes, and newlines with commas
  let processed = content.replace(/[\t|"'\r\n]+/g, ',');

  // Replace multiple consecutive commas with single comma
  processed = processed.replace(/,+/g, ',');

  // Remove leading and trailing commas
  processed = processed.replace(/^,|,$/g, '');

  // Split by comma and filter empty strings
  return processed.split(',').filter(item => item.trim() !== '');
};

/**
 * Parse CSV content into rows and columns
 * @param {string} text - CSV text content
 * @returns {string[][]} Array of rows, each row is an array of columns
 */
export const parseCSV = (text) => {
  if (!text) return [];

  return text
    .replace(/\r\n/g, '\n')   // Normalize Windows line endings
    .replace(/\r/g, '\n')     // Normalize old Mac line endings
    .split('\n')              // Split by Unix/Linux line endings
    .filter(line => line.trim() !== '')  // Remove empty lines
    .map(line => line.split(',').map(cell => cell.trim()));
};

/**
 * Parse address string with optional port and remark
 * Format: address[:port][#remark]
 *
 * @param {string} addressStr - Address string to parse
 * @returns {Object} Parsed address object
 */
export const parseAddress = (addressStr) => {
  const regex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\[.*\]):?(\d+)?#?(.*)?$/;
  const match = addressStr.match(regex);

  let address = addressStr;
  let port = '-1';
  let remark = addressStr;

  if (match) {
    address = match[1];
    port = match[2] || '-1';
    remark = match[3] || address;
  } else {
    // Manual parsing for non-standard formats
    if (addressStr.includes(':') && addressStr.includes('#')) {
      const parts = addressStr.split(':');
      address = parts[0];
      const subParts = parts[1].split('#');
      port = subParts[0];
      remark = subParts[1];
    } else if (addressStr.includes(':')) {
      const parts = addressStr.split(':');
      address = parts[0];
      port = parts[1];
    } else if (addressStr.includes('#')) {
      const parts = addressStr.split('#');
      address = parts[0];
      remark = parts[1];
    }

    // Clean up remark if it contains port
    if (remark.includes(':')) {
      remark = remark.split(':')[0];
    }
  }

  return { address, port, remark };
};

/**
 * Parse VMess link
 * @param {string} vmessLink - VMess link (vmess://base64)
 * @returns {Object|null} Parsed VMess configuration or null if invalid
 */
export const parseVMessLink = (vmessLink) => {
  if (!vmessLink.startsWith('vmess://')) {
    return null;
  }

  try {
    const base64Part = vmessLink.substring(8);
    const jsonStr = Buffer.from(base64Part, 'base64').toString('utf-8');
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse VMess link:', error);
    return null;
  }
};

/**
 * Parse VLESS/Trojan link
 * Format: protocol://uuid@host:port?params#remark
 *
 * @param {string} link - VLESS or Trojan link
 * @returns {Object|null} Parsed configuration or null if invalid
 */
export const parseVLESSOrTrojanLink = (link) => {
  try {
    const [protocol, rest] = link.split('://');
    if (!rest) return null;

    const [credentials, paramsAndRemark] = rest.split('?');
    const [uuid, hostPort] = credentials.split('@');
    const [host, port] = hostPort.split(':');

    let params = {};
    let remark = '';

    if (paramsAndRemark) {
      const [paramStr, remarkStr] = paramsAndRemark.split('#');
      remark = decodeURIComponent(remarkStr || '');

      // Parse query parameters
      paramStr.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) {
          params[key] = decodeURIComponent(value);
        }
      });
    }

    return {
      protocol,
      uuid,
      host,
      port,
      params,
      remark,
    };
  } catch (error) {
    console.error('Failed to parse VLESS/Trojan link:', error);
    return null;
  }
};

/**
 * Validate IPv4 address
 * @param {string} address - IP address to validate
 * @returns {boolean} True if valid IPv4 address
 */
export const isValidIPv4 = (address) => {
  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(address);
};

/**
 * Extract port from address if it contains a known port
 * @param {string} address - Address string
 * @param {string[]} portList - List of known ports
 * @returns {string} Extracted port or '-1' if not found
 */
export const extractPortFromAddress = (address, portList) => {
  for (const port of portList) {
    if (address.includes(port)) {
      return port;
    }
  }
  return '-1';
};

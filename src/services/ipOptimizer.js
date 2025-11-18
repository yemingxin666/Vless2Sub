/**
 * IP Optimizer Service
 *
 * Handles fetching and processing optimized IP addresses from various sources.
 * Follows Single Responsibility Principle.
 */

import axios from 'axios';
import config from '../config/index.js';
import { parseContent, parseCSV, parseAddress } from '../utils/parser.js';

// Global proxy IP pool
export let proxyIPPool = [];

/**
 * Fetch and process API list
 * @param {string[]} apiList - List of API URLs
 * @param {number} timeout - Request timeout in ms
 * @returns {Promise<string[]>} Processed address list
 */
export const fetchOptimizedList = async (apiList, timeout = 2000) => {
  if (!apiList || apiList.length === 0) return [];

  const results = [];

  try {
    const promises = apiList.map(async (apiUrl) => {
      try {
        const response = await axios.get(apiUrl, {
          timeout,
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;',
            'User-Agent': `${config.subscription.name}`,
          },
        });

        if (response.status === 200) {
          const content = response.data;
          const lines = content.split(/\r?\n/);

          // Check if it's CSV format
          if (lines[0].split(',').length > 3) {
            const idMatch = apiUrl.match(/id=([^&]*)/);
            const remark = idMatch ? idMatch[1] : '';

            const portMatch = apiUrl.match(/port=([^&]*)/);
            const port = portMatch ? portMatch[1] : '443';

            const addresses = [];
            for (let i = 1; i < lines.length; i++) {
              const columns = lines[i].split(',')[0];
              if (columns) {
                const addr = `${columns}:${port}${remark ? `#${remark}` : ''}`;
                addresses.push(addr);

                // Add to proxy IP pool if marked
                if (apiUrl.includes('proxyip=true')) {
                  proxyIPPool.push(`${columns}:${port}`);
                }
              }
            }
            return addresses;
          } else {
            // Regular format
            const parsed = parseContent(content);

            // Add to proxy IP pool if marked
            if (apiUrl.includes('proxyip=true')) {
              parsed.forEach(item => {
                const { address, port } = parseAddress(item);
                if (port !== '-1' && !config.constants.httpsPorts.includes(port)) {
                  proxyIPPool.push(`${address}:${port}`);
                } else if (port === '-1') {
                  proxyIPPool.push(`${address}:443`);
                }
              });
            }

            return parsed;
          }
        }
      } catch (error) {
        console.error(`Failed to fetch ${apiUrl}:`, error.message);
      }

      return [];
    });

    const allResults = await Promise.allSettled(promises);

    allResults.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(...result.value);
      }
    });
  } catch (error) {
    console.error('Error in fetchOptimizedList:', error);
  }

  return results;
};

/**
 * Process CSV speed test results
 * @param {string} tlsMode - TLS mode ('TRUE' or 'FALSE')
 * @returns {Promise<string[]>} Processed address list
 */
export const processCSVResults = async (tlsMode) => {
  const { csv } = config.addresses;
  const { dls, csvRemarkIndex } = config.advanced;

  if (!csv || csv.length === 0) {
    return [];
  }

  const results = [];

  try {
    const promises = csv.map(async (csvUrl) => {
      try {
        const response = await axios.get(csvUrl, { timeout: 5000 });

        if (response.status === 200) {
          const rows = parseCSV(response.data);
          const [header, ...dataRows] = rows;

          const tlsIndex = header.findIndex(col => col.toUpperCase() === 'TLS');
          if (tlsIndex === -1) {
            throw new Error('CSV missing TLS column');
          }

          return dataRows
            .filter(row => {
              const tlsValue = row[tlsIndex].toUpperCase();

              // Try to get speed from download speed column (second to last) or TCP latency (third to last)
              let speed = parseFloat(row[row.length - 2]); // Download speed
              let isLatencyMode = false;

              if (isNaN(speed) || speed === 0) {
                // If download speed is empty, use TCP latency (lower is better)
                const latency = parseFloat(row[row.length - 3]);
                isLatencyMode = true;

                // For latency mode: valid if latency exists and is less than DLS threshold
                // Return a dummy high value if valid, 0 if invalid
                speed = latency && latency < dls ? 100 : 0;
              }

              // Support both "TRUE"/"FALSE" and "Yes"/"No" formats
              const isTLS = tlsValue === 'TRUE' || tlsValue === 'YES';
              const wantTLS = tlsMode.toUpperCase() === 'TRUE';

              // For download speed mode: speed > dls
              // For latency mode: speed > 0 (already filtered by latency < dls above)
              return isTLS === wantTLS && speed > (isLatencyMode ? 0 : dls);
            })
            .map(row => {
              const ipAddress = row[0];
              const port = row[1];
              const dataCenter = row[tlsIndex + csvRemarkIndex];
              const formattedAddress = `${ipAddress}:${port}#${dataCenter}`;

              // Add to proxy IP pool if applicable
              if (csvUrl.includes('proxyip=true') &&
                  row[tlsIndex].toUpperCase() === 'TRUE' &&
                  !config.constants.httpsPorts.includes(port)) {
                proxyIPPool.push(`${ipAddress}:${port}`);
              }

              return formattedAddress;
            });
        }
      } catch (error) {
        console.error(`Failed to process CSV ${csvUrl}:`, error.message);
      }

      return [];
    });

    const allResults = await Promise.all(promises);
    allResults.forEach(result => results.push(...result));
  } catch (error) {
    console.error('Error in processCSVResults:', error);
  }

  return results;
};

/**
 * Get all optimized addresses
 * @param {boolean} includeTLS - Include TLS addresses
 * @param {boolean} includeNoTLS - Include non-TLS addresses
 * @returns {Promise<Object>} Object with tls and noTls address arrays
 */
export const getAllOptimizedAddresses = async (includeTLS = true, includeNoTLS = false) => {
  const result = {
    tls: [],
    noTls: [],
  };

  try {
    if (includeTLS) {
      // Fetch TLS addresses
      const tlsAddresses = config.addresses.tls || [];
      const tlsApiAddresses = await fetchOptimizedList(config.addresses.tlsApi);
      const tlsCsvAddresses = await processCSVResults('TRUE');

      result.tls = Array.from(new Set([
        ...tlsAddresses,
        ...tlsApiAddresses,
        ...tlsCsvAddresses,
      ].filter(Boolean)));
    }

    if (includeNoTLS) {
      // Fetch non-TLS addresses
      const noTlsAddresses = config.addresses.noTls || [];
      const noTlsApiAddresses = await fetchOptimizedList(config.addresses.noTlsApi);
      const noTlsCsvAddresses = await processCSVResults('FALSE');

      result.noTls = Array.from(new Set([
        ...noTlsAddresses,
        ...noTlsApiAddresses,
        ...noTlsCsvAddresses,
      ].filter(Boolean)));
    }
  } catch (error) {
    console.error('Error in getAllOptimizedAddresses:', error);
  }

  return result;
};

export default {
  fetchOptimizedList,
  processCSVResults,
  getAllOptimizedAddresses,
  get proxyIPPool() {
    return proxyIPPool;
  },
};

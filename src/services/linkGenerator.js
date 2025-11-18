/**
 * Link Generator Service
 *
 * Generates subscription links for various protocols.
 * Follows Open/Closed Principle - easy to extend for new protocols.
 */

import config from '../config/index.js';
import { utf8ToBase64 } from '../utils/crypto.js';
import { parseAddress, isValidIPv4, extractPortFromAddress } from '../utils/parser.js';
import { proxyIPPool } from './ipOptimizer.js';

/**
 * Generate VMess link
 * @param {Object} params - Link parameters
 * @returns {string} VMess link
 */
export const generateVMessLink = (params) => {
  const {
    address,
    port,
    uuid,
    host,
    path,
    sni,
    type,
    remark,
    alterId = '0',
    security = 'auto',
    tls = '',
    scv = 'false',
    alpn = '',
    encryption = '',
  } = params;

  const vmessConfig = {
    v: '2',
    ps: remark,
    add: address,
    port: port,
    id: uuid,
    aid: alterId,
    scy: security,
    net: 'ws',
    type: type,
    host: host,
    path: path,
    tls: tls,
    sni: tls === 'tls' ? (sni || host) : '',
    encryption: encryption,
    alpn: tls === 'tls' ? encodeURIComponent(alpn) : '',
    fp: tls === 'tls' ? 'random' : '',
  };

  if (tls === 'tls') {
    vmessConfig.allowInsecure = scv === 'true' ? '1' : '0';
  }

  return `vmess://${utf8ToBase64(JSON.stringify(vmessConfig))}`;
};

/**
 * Generate VLESS link
 * @param {Object} params - Link parameters
 * @returns {string} VLESS link
 */
export const generateVLESSLink = (params) => {
  const {
    address,
    port,
    uuid,
    host,
    path,
    sni,
    type,
    remark,
    security = '',
    scv = 'false',
    alpn = '',
    encryption = 'none',
    xhttp = '',
  } = params;

  // Build query parameters
  const queryParams = new URLSearchParams();

  if (security) {
    queryParams.append('security', security);
    queryParams.append('sni', sni);
    queryParams.append('fp', 'random');
    queryParams.append('alpn', alpn);
    if (scv === 'true') {
      queryParams.append('allowInsecure', '1');
    }
  } else {
    queryParams.append('security', '');
  }

  queryParams.append('type', type);
  queryParams.append('host', host);
  queryParams.append('path', path + xhttp);
  queryParams.append('encryption', encryption);

  return `vless://${uuid}@${address}:${port}?${queryParams.toString()}#${encodeURIComponent(remark)}`;
};

/**
 * Generate Trojan link
 * @param {Object} params - Link parameters
 * @returns {string} Trojan link
 */
export const generateTrojanLink = (params) => {
  const {
    address,
    port,
    password,
    host,
    path,
    sni,
    type,
    remark,
    scv = 'false',
    alpn = '',
    encryption = '',
  } = params;

  const queryParams = new URLSearchParams({
    security: 'tls',
    sni: sni,
    encryption: encryption,
    alpn: encodeURIComponent(alpn),
    fp: 'random',
    type: type,
    host: host,
    path: path + (scv === 'true' ? '&allowInsecure=1' : ''),
    fragment: '1,40-60,30-50,tlshello',
  });

  return `trojan://${password}@${address}:${port}?${queryParams.toString()}#${encodeURIComponent(remark)}`;
};

/**
 * Select proxy IP based on address
 * @param {string} addressId - Address identifier
 * @param {string} address - IP address
 * @returns {string} Proxy IP path or empty string
 */
const selectProxyIP = (addressId, address) => {
  const lowerAddressId = addressId.toLowerCase();
  const { matchIps } = config.proxy;
  const proxyIPs = config.proxy.ips;

  // Check if there's a matching proxy IP in the pool
  const matchingProxyIP = proxyIPPool.find(proxyIP => proxyIP.includes(address));
  if (matchingProxyIP) {
    return `/proxyip=${matchingProxyIP}`;
  }

  // Check for matched proxy IPs
  for (const item of matchIps) {
    if (item.includes('#') && item.split('#')[1] && lowerAddressId.includes(item.split('#')[1].toLowerCase())) {
      return `/proxyip=${item.split('#')[0]}`;
    } else if (item.includes(':') && item.split(':')[1] && lowerAddressId.includes(item.split(':')[1].toLowerCase())) {
      return `/proxyip=${item.split(':')[0]}`;
    }
  }

  // Random proxy IP
  const randomProxyIP = proxyIPs[Math.floor(Math.random() * proxyIPs.length)];
  return `/proxyip=${randomProxyIP}`;
};

/**
 * Generate subscription links from address list
 * @param {string[]} addresses - List of addresses
 * @param {Object} baseConfig - Base configuration
 * @param {boolean} useTLS - Use TLS
 * @returns {string[]} Array of generated links
 */
export const generateLinksFromAddresses = (addresses, baseConfig, useTLS = true) => {
  const links = [];
  const { uuid, password, host, path, sni, type, alpn, encryption } = baseConfig;
  const { scv } = config.advanced;
  const protocol = password ? 'Trojan' : (baseConfig.alterId !== undefined ? 'VMess' : 'VLESS');

  for (const addressStr of addresses) {
    const { address, port: parsedPort, remark } = parseAddress(addressStr);
    let port = parsedPort;

    // Determine port
    if (port === '-1') {
      if (useTLS) {
        if (!isValidIPv4(address)) {
          port = extractPortFromAddress(address, config.constants.httpsPorts);
        }
        if (port === '-1') port = '443';
      } else {
        if (!isValidIPv4(address)) {
          port = extractPortFromAddress(address, config.constants.httpPorts);
        }
        if (port === '-1') port = '80';
      }
    }

    // Determine path (with proxy IP if enabled)
    let finalPath = path;
    if (config.other.ed === 'cmliu' && config.proxy.enableRemote === 'true') {
      finalPath = selectProxyIP(remark, address);
    }

    const linkParams = {
      address,
      port,
      host,
      path: finalPath,
      sni: sni || host,
      type,
      remark: remark + config.other.ps,
      scv,
      alpn,
      encryption,
    };

    if (protocol === 'VMess') {
      links.push(generateVMessLink({
        ...linkParams,
        uuid,
        alterId: baseConfig.alterId || '0',
        security: baseConfig.security || 'auto',
        tls: useTLS ? 'tls' : '',
      }));
    } else if (protocol === 'Trojan') {
      links.push(generateTrojanLink({
        ...linkParams,
        password,
      }));
    } else {
      links.push(generateVLESSLink({
        ...linkParams,
        uuid,
        security: useTLS ? 'tls' : '',
        xhttp: baseConfig.xhttp || '',
      }));
    }
  }

  return links;
};

export default {
  generateVMessLink,
  generateVLESSLink,
  generateTrojanLink,
  generateLinksFromAddresses,
};

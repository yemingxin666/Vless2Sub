/**
 * Subscription Controller
 *
 * Handles subscription generation requests.
 * Follows Single Responsibility Principle.
 */

import config from '../config/index.js';
import { getAllOptimizedAddresses } from '../services/ipOptimizer.js';
import { generateLinksFromAddresses } from '../services/linkGenerator.js';
import { utf8ToBase64 } from '../utils/crypto.js';
import { validateQueryParams } from '../utils/validator.js';

/**
 * Generate subscription
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const generateSubscription = async (req, res) => {
  try {
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Extract and validate query parameters
    const allowedParams = ['host', 'uuid', 'password', 'pw', 'path', 'sni', 'type', 'scv', 'allowInsecure', 'alpn', 'encryption', 'alterid', 'security', 'mode', 'extra'];
    const params = validateQueryParams(Object.fromEntries(url.searchParams), allowedParams);

    // Get configuration
    const host = params.host || config.host.domain;
    const uuid = params.uuid || params.password || params.pw || config.host.uuid;
    const path = params.path || config.host.path;
    const sni = params.sni || host;
    const type = params.type || config.host.type;
    if(host || host === 'null'){
      host="127.0.0.1";
    }
    // Validate required parameters
    if ( !uuid || uuid === 'null') {
      return res.status(400).send(`Missing required parameters: host and uuid

${url.origin}/sub?host=[your host]&uuid=[your uuid]&path=[your path]
`);
    }

    // Determine protocol
    let protocol = 'VLESS';
    if (params.alterid !== undefined) {
      protocol = 'VMess';
    } else if (params.password || params.pw) {
      protocol = 'Trojan';
    }

    // Get optimized addresses
    const needNoTLS = config.advanced.noTls === 'true' || protocol === 'VMess';
    const addresses = await getAllOptimizedAddresses(true, needNoTLS);

    // If no optimized addresses, use host as default address
    if (addresses.tls.length === 0 && addresses.noTls.length === 0) {
      addresses.tls = [host];
    }

    // Generate links
    const baseConfig = {
      uuid,
      password: params.password || params.pw,
      host,
      path,
      sni,
      type,
      alterId: params.alterid,
      security: params.security,
      alpn: params.alpn || config.advanced.alpn || '',
      encryption: params.encryption || config.advanced.encryption || 'none',
      xhttp: (params.mode ? `&mode=${params.mode}` : '') + (params.extra ? `&extra=${encodeURIComponent(params.extra)}` : ''),
    };

    const tlsLinks = generateLinksFromAddresses(addresses.tls, baseConfig, true);
    const noTlsLinks = needNoTLS ? generateLinksFromAddresses(addresses.noTls, baseConfig, false) : [];

    // Combine all links
    const allLinks = [...tlsLinks, ...noTlsLinks];

    // Check if client wants specific format
    const format = url.searchParams.get('format')?.toLowerCase();
    const isSubConverterRequest = req.headers['subconverter-request'] || req.headers['subconverter-version'];

    // Handle format conversion (Clash, Sing-box, etc.)
    if (format && ['clash', 'singbox', 'surge'].includes(format)) {
      const subApi = config.subscription.api;
      const subConfig = config.subscription.config;
      const subProtocol = config.subscription.protocol;
      const scv = config.advanced.scv || 'false';

      // Build the original subscription URL (without format parameter)
      const originalUrl = new URL(req.url, `http://${req.headers.host}`);
      originalUrl.searchParams.delete('format'); // Remove format parameter
      const subscriptionUrl = originalUrl.href;

      // Build subscription converter URL
      const converterUrl = `${subProtocol}://${subApi}/sub?target=${format}&url=${encodeURIComponent(subscriptionUrl)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=${scv}&fdn=false&sort=false&new_name=true`;

      // Redirect to converter
      return res.redirect(converterUrl);
    }

    // Default: return base64 encoded links
    const base64Content = utf8ToBase64(allLinks.join('\n'));

    res.set({
      'Content-Type': 'text/plain; charset=utf-8',
      'Profile-Update-Interval': `${config.subscription.updateTime}`,
      'Profile-web-page-url': url.origin,
    });

    res.send(base64Content);
  } catch (error) {
    console.error('Error generating subscription:', error);
    res.status(500).send(`Error: ${error.message}`);
  }
};

export default {
  generateSubscription,
};

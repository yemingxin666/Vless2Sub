/**
 * Clash Configuration Generator
 *
 * Generates custom Clash config without external templates
 */

import config from '../config/index.js';

/**
 * Parse proxy link to Clash format
 */
const parseProxyLink = (link) => {
  if (link.startsWith('vless://')) {
    const [, rest] = link.split('vless://');
    const [userInfo, paramsPart] = rest.split('?');
    const [uuid, addressPort] = userInfo.split('@');
    const [address, port] = addressPort.split(':');
    const params = new URLSearchParams(paramsPart.split('#')[0]);
    const name = decodeURIComponent(paramsPart.split('#')[1] || address);

    return {
      name,
      type: 'vless',
      server: address,
      port: parseInt(port),
      uuid,
      network: params.get('type') || 'ws',
      tls: params.get('security') === 'tls',
      'skip-cert-verify': params.get('allowInsecure') === '1',
      servername: params.get('sni') || '',
      'ws-opts': {
        path: params.get('path') || '/',
        headers: { Host: params.get('host') || address }
      }
    };
  }

  if (link.startsWith('vmess://')) {
    const json = JSON.parse(Buffer.from(link.substring(8), 'base64').toString());
    return {
      name: json.ps || json.add,
      type: 'vmess',
      server: json.add,
      port: parseInt(json.port),
      uuid: json.id,
      alterId: parseInt(json.aid || 0),
      cipher: json.scy || 'auto',
      network: json.net || 'ws',
      tls: json.tls === 'tls',
      'skip-cert-verify': json.allowInsecure === '1',
      servername: json.sni || '',
      'ws-opts': {
        path: json.path || '/',
        headers: { Host: json.host || json.add }
      }
    };
  }

  if (link.startsWith('trojan://')) {
    const [, rest] = link.split('trojan://');
    const [password, addressPort] = rest.split('@');
    const [addressPortPart, paramsPart] = addressPort.split('?');
    const [address, port] = addressPortPart.split(':');
    const params = new URLSearchParams(paramsPart.split('#')[0]);
    const name = decodeURIComponent(paramsPart.split('#')[1] || address);

    return {
      name,
      type: 'trojan',
      server: address,
      port: parseInt(port),
      password,
      network: params.get('type') || 'ws',
      sni: params.get('sni') || address,
      'skip-cert-verify': params.get('allowInsecure') === '1',
      'ws-opts': {
        path: params.get('path') || '/',
        headers: { Host: params.get('host') || address }
      }
    };
  }

  return null;
};

/**
 * Generate Clash configuration
 */
export const generateClashConfig = (links) => {
  const proxies = links
    .map(link => parseProxyLink(link.trim()))
    .filter(Boolean);

  const proxyNames = proxies.map(p => p.name);

  const clashConfig = {
    port: 7890,
    'socks-port': 7891,
    'allow-lan': false,
    mode: 'rule',
    'log-level': 'info',
    'external-controller': '127.0.0.1:9090',

    proxies,

    'proxy-groups': [
      {
        name: '自动选择',
        type: 'url-test',
        proxies: proxyNames,
        url: 'http://www.gstatic.com/generate_204',
        interval: 300
      }
    ],

    rules: [
      'MATCH,自动选择'
    ]
  };

  return clashConfig;
};

export default { generateClashConfig };

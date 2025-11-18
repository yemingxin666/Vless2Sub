/**
 * UI Controller
 *
 * Handles UI page rendering.
 * Follows Single Responsibility Principle.
 */

import config from '../config/index.js';

/**
 * Generate HTML page
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const renderUI = (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { name: fileName, api: subConverter, protocol: subProtocol, config: subConfig } = config.subscription;
  const { icon, avatar, backgrounds, beian } = config.ui;

  // Generate UI customization
  const websiteIcon = icon ? `<link rel="icon" sizes="32x32" href="${icon}">` : '';
  const websiteAvatar = avatar ? `<div class="logo-wrapper"><div class="logo-border"></div><img src="${avatar}" alt="Logo"></div>` : '';
  const websiteBackground = backgrounds.length > 0
    ? `background-image: url('${backgrounds[Math.floor(Math.random() * backgrounds.length)]}');`
    : '';

  const HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  ${websiteIcon}
  <style>
    :root {
      --primary-color: #4361ee;
      --hover-color: #3b4fd3;
      --bg-color: #f5f6fa;
      --card-bg: #ffffff;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      ${websiteBackground}
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      background-color: var(--bg-color);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .container {
      position: relative;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      max-width: 600px;
      width: 90%;
      padding: 2rem;
      border-radius: 20px;
      box-shadow: 0 10px 20px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.1);
      transition: transform 0.3s ease;
    }

    .container:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.2);
    }

    h1 {
      text-align: center;
      color: var(--primary-color);
      margin-bottom: 2rem;
      font-size: 1.8rem;
    }

    .input-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 2px solid rgba(0, 0, 0, 0.15);
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.3s ease;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
    }

    input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.03);
    }

    button {
      width: 100%;
      padding: 12px;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 1.5rem;
    }

    button:hover {
      background-color: var(--hover-color);
      transform: translateY(-2px);
    }

    button:active {
      transform: translateY(0);
    }

    #result {
      background-color: #f8f9fa;
      font-family: monospace;
      word-break: break-all;
    }

    .beian-info {
      text-align: center;
      font-size: 13px;
    }

    .beian-info a {
      color: var(--primary-color);
      text-decoration: none;
      border-bottom: 1px dashed var(--primary-color);
      padding-bottom: 2px;
    }

    .beian-info a:hover {
      border-bottom-style: solid;
    }

    .logo-title {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 2rem;
    }

    .logo-wrapper {
      position: absolute;
      left: 0;
      width: 50px;
      height: 50px;
    }

    .logo-title img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      position: relative;
      z-index: 1;
      background: var(--card-bg);
      box-shadow: 0 0 15px rgba(67, 97, 238, 0.1);
    }

    .logo-border {
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      border-radius: 50%;
      animation: rotate 3s linear infinite;
      background: conic-gradient(from 0deg, transparent 0%, var(--primary-color) 20%, rgba(67, 97, 238, 0.8) 40%, transparent 60%, transparent 100%);
      box-shadow: 0 0 10px rgba(67, 97, 238, 0.3);
      filter: blur(0.5px);
    }

    .logo-border::after {
      content: '';
      position: absolute;
      inset: 3px;
      border-radius: 50%;
      background: var(--card-bg);
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 480px) {
      .container {
        padding: 1.5rem;
      }

      h1 {
        font-size: 1.5rem;
      }

      .logo-wrapper {
        width: 40px;
        height: 40px;
      }
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
</head>
<body>
  <div class="container">
    <div class="logo-title">
      ${websiteAvatar}
      <h1>${fileName}</h1>
    </div>
    <div class="input-group">
      <label for="link">节点链接</label>
      <input type="text" id="link" placeholder="请输入 VMess / VLESS / Trojan 链接">
    </div>

    <button onclick="generateLink()">生成优选订阅</button>

    <div class="input-group">
      <label for="result">优选订阅</label>
      <input type="text" id="result" readonly onclick="copyToClipboard()">
      <div id="qrcode" style="display: flex; justify-content: center; margin-top: 20px;"></div>
    </div>
    <div class="beian-info">${beian}</div>
  </div>

  <script>
    function copyToClipboard() {
      const resultInput = document.getElementById('result');
      if (!resultInput.value) return;

      resultInput.select();
      navigator.clipboard.writeText(resultInput.value).then(() => {
        const tooltip = document.createElement('div');
        tooltip.style.cssText = 'position:fixed;left:50%;top:20px;transform:translateX(-50%);padding:8px 16px;background:#4361ee;color:white;border-radius:4px;z-index:1000';
        tooltip.textContent = '已复制到剪贴板';
        document.body.appendChild(tooltip);
        setTimeout(() => document.body.removeChild(tooltip), 2000);
      }).catch(() => alert('复制失败，请手动复制'));
    }

    function generateLink() {
      const link = document.getElementById('link').value;
      if (!link) {
        alert('请输入节点链接');
        return;
      }

      let uuidType = 'uuid';
      const isTrojan = link.startsWith('trojan://');
      if (isTrojan) uuidType = 'password';

      let subLink = '';
      try {
        const isVMess = link.startsWith('vmess://');
        if (isVMess) {
          const vmessLink = link.split('vmess://')[1];
          const vmessJson = JSON.parse(atob(vmessLink));

          const host = vmessJson.host;
          const uuid = vmessJson.id;
          const path = vmessJson.path || '/';
          const sni = vmessJson.sni || host;
          const encryption = vmessJson.encryption || '';
          const type = vmessJson.type || 'none';
          const alpn = vmessJson.alpn || '';
          const alterId = vmessJson.aid || 0;
          const security = vmessJson.scy || 'auto';
          const domain = window.location.hostname;
          const token = window.location.pathname.split('/')[1];

          subLink = \`https://\${domain}/\${token}/sub?host=\${host}&uuid=\${uuid}&path=\${encodeURIComponent(path)}&sni=\${sni}&encryption=\${encryption}&type=\${type}&alpn=\${encodeURIComponent(alpn)}&alterid=\${alterId}&security=\${security}\`;
        } else {
          const uuid = link.split("//")[1].split("@")[0];
          const search = link.split("?")[1].split("#")[0];
          const domain = window.location.hostname;
          const token = window.location.pathname.split('/')[1];

          subLink = \`https://\${domain}/\${token}/sub?\${uuidType}=\${uuid}&\${search}\`;
        }
        document.getElementById('result').value = subLink;

        // Generate QR code
        const qrcodeDiv = document.getElementById('qrcode');
        qrcodeDiv.innerHTML = '';
        new QRCode(qrcodeDiv, {
          text: subLink,
          width: 220,
          height: 220,
          colorDark: "#4a60ea",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.L
        });
      } catch (error) {
        alert('链接格式错误，请检查输入');
      }
    }
  </script>
</body>
</html>`;

  res.set('Content-Type', 'text/html; charset=UTF-8');
  res.send(HTML);
};

export default {
  renderUI,
};

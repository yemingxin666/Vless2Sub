# VLESS2SUB

一个功能强大的 VLESS/VMess/Trojan 订阅生成器，基于 Node.js 构建，提供优选 IP、多格式转换和 Web UI 界面。

## ✨ 功能特性

- 🚀 支持 VLESS、VMess、Trojan 多种协议
- 🌐 智能 IP 优选（支持 API、CSV、静态列表）
- 🔄 多种订阅格式转换（Clash、Sing-box、Surge）
- 🎨 现代化 Web UI 界面
- 🔒 代理 IP 支持
- 🆔 动态 UUID 生成
- ⚡ 高性能并发处理

## 📦 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

**必填配置：**

```env
# 服务器端口
PORT=3000

# 访问令牌（用于保护订阅端点）
TOKEN=auto

# 你的域名
HOST=your-domain.com

# VLESS/VMess UUID 或 Trojan 密码
UUID=your-uuid-here
# 或者使用 PASSWORD=your-password-here (Trojan)

# WebSocket 路径
PATH=/?ed=2560
```

### 3. 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务将在 `http://localhost:3000` 启动。

## 📖 使用指南

### Web UI 界面

访问：`http://localhost:3000/{TOKEN}`

例如，如果你的 TOKEN 是 `auto`，则访问：
```
http://localhost:3000/auto
```

在 Web UI 中，你可以：
1. 输入现有的 VMess/VLESS/Trojan 节点链接
2. 点击"生成优选订阅"按钮
3. 获取优选订阅链接和二维码

### 订阅 API

直接生成订阅：
```
http://localhost:3000/{TOKEN}/sub?host={host}&uuid={uuid}&path={path}
```

**参数说明：**
- `host`: 你的域名
- `uuid`: VLESS/VMess UUID 或 `password` (Trojan)
- `path`: WebSocket 路径（可选，默认 `/?ed=2560`）
- `sni`: SNI 域名（可选，默认使用 host）
- `type`: 传输类型（可选，默认 `ws`）

**示例：**
```
http://localhost:3000/auto/sub?host=example.com&uuid=00000000-0000-0000-0000-000000000000&path=/ws
```

## ⚙️ 高级配置

### IP 优选

在 `.env` 中配置优选 IP 地址：

```env
# 静态 IP 地址列表（逗号分隔）
ADD=1.1.1.1,8.8.8.8

# API 接口（返回 IP 列表）
ADDAPI=https://example.com/api/ips

# CSV 文件（包含测速结果）
ADDCSV=https://example.com/speed-test.csv
```

### 代理 IP

配置代理 IP 以优化连接：

```env
PROXYIP=proxyip.example.com
PROXYIPAPI=https://example.com/api/proxyips
RPROXYIP=true
```

### UI 自定义

```env
# 网站图标
ICO=https://example.com/favicon.ico

# 网站头像
PNG=https://example.com/avatar.png

# 背景图片（逗号分隔，随机选择）
IMG=https://example.com/bg1.jpg,https://example.com/bg2.jpg

# 备案信息
BEIAN=<a href='https://example.com'>备案号</a>
```

## 📁 项目结构

```
vless2sub/
├── src/
│   ├── config/          # 配置管理
│   ├── controllers/     # 控制器层
│   ├── services/        # 业务逻辑层
│   ├── utils/           # 工具函数
│   ├── middleware/      # 中间件
│   ├── routes/          # 路由定义
│   └── app.js           # Express 应用
├── public/              # 静态资源
├── .env                 # 环境变量
├── .env.example         # 环境变量示例
├── package.json
├── server.js            # 入口文件
└── README.md
```

### 核心模块说明

#### 配置管理 (src/config/)
- 集中管理所有配置项
- 环境变量读取和验证
- 类型转换和默认值处理

#### 控制器层 (src/controllers/)
- `subscription.js` - 订阅生成控制器
- `ui.js` - Web UI 渲染控制器

#### 服务层 (src/services/)
- `ipOptimizer.js` - IP 优选服务
- `linkGenerator.js` - 链接生成服务

#### 工具函数 (src/utils/)
- `crypto.js` - 加密和哈希工具
- `parser.js` - 数据解析工具
- `validator.js` - 输入验证工具

#### 中间件 (src/middleware/)
- `auth.js` - Token 认证中间件
- `errorHandler.js` - 统一错误处理

## 🏗️ 架构设计

本项目遵循现代软件工程最佳实践，采用分层架构设计：

### SOLID 原则

- **单一职责原则 (SRP)**: 每个模块只负责一个功能
- **开闭原则 (OCP)**: 易于扩展新协议，无需修改现有代码
- **里氏替换原则 (LSP)**: 服务层接口统一，可替换实现
- **接口隔离原则 (ISP)**: 小而专一的接口，避免"胖接口"
- **依赖倒置原则 (DIP)**: 依赖配置而非硬编码

### 其他原则

- **KISS (Keep It Simple)**: 保持代码简洁易懂
- **DRY (Don't Repeat Yourself)**: 避免重复代码，提取公共函数
- **YAGNI (You Aren't Gonna Need It)**: 只实现当前需要的功能

### 设计特点

- 🔧 **模块化设计**: 清晰的模块划分，易于维护
- 🔄 **可扩展性**: 易于添加新协议和数据源
- 🛡️ **安全性**: 输入验证、XSS 防护、Token 认证
- ⚡ **高性能**: 并发请求处理、超时控制
- 📝 **可维护性**: JSDoc 注释、统一代码风格

## 🚀 部署指南

### 开发环境

```bash
npm run dev
```

### 生产环境

#### 方案 1: PM2 进程管理

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start server.js --name vless2sub

# 保存配置
pm2 save

# 设置开机自启
pm2 startup
```

#### 方案 2: Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 方案 3: HTTPS 配置

使用 Let's Encrypt 配置 HTTPS：

```bash
sudo certbot --nginx -d your-domain.com
```

#### 方案 4: Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

构建和运行：

```bash
docker build -t vless2sub .
docker run -d -p 3000:3000 --env-file .env --name vless2sub vless2sub
```

#### 方案 5: Systemd 服务

创建 `/etc/systemd/system/vless2sub.service`：

```ini
[Unit]
Description=VLESS2SUB Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/vless2sub
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl enable vless2sub
sudo systemctl start vless2sub
```

## 🔧 故障排查

### 服务无法启动

1. **检查端口是否被占用：**
```bash
# Linux/Mac
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

2. **检查环境变量配置是否正确**
   - 确认 `.env` 文件存在
   - 验证必填字段已配置

3. **查看错误日志**
   - 检查控制台输出
   - 查看 PM2 日志：`pm2 logs vless2sub`

### 订阅生成失败

1. **检查配置**
   - 确认 HOST 和 UUID 配置正确
   - 验证 PATH 格式正确

2. **检查网络连接**
   - 确认 IP 优选 API 可访问
   - 测试外部 API 响应

3. **查看详细错误**
   - 打开浏览器开发者工具
   - 查看控制台错误信息

### 性能问题

1. **优化配置**
   - 减少 IP 优选数量
   - 调整请求超时时间

2. **使用缓存**
   - 考虑集成 Redis 缓存
   - 缓存优选 IP 结果

3. **负载均衡**
   - 使用 Nginx 负载均衡
   - 部署多个实例

## 🔐 安全建议

1. **保护 TOKEN**
   - 使用强随机字符串
   - 定期更换 TOKEN

2. **HTTPS 部署**
   - 生产环境必须使用 HTTPS
   - 配置 SSL 证书

3. **防火墙配置**
   - 限制访问来源
   - 配置速率限制

4. **定期更新**
   - 及时更新依赖包
   - 关注安全公告

## 🛠️ 扩展开发

### 添加新协议

在 `src/services/linkGenerator.js` 中添加新的生成函数：

```javascript
export function generateNewProtocol(config) {
  // 实现新协议的链接生成逻辑
}
```

### 添加新数据源

在 `src/services/ipOptimizer.js` 中添加新的获取方法：

```javascript
async function fetchFromNewSource() {
  // 实现新数据源的获取逻辑
}
```

### 添加新中间件

在 `src/middleware/` 目录创建新文件：

```javascript
export function newMiddleware(req, res, next) {
  // 实现中间件逻辑
  next();
}
```

## 📊 性能优化

- ✅ 并发请求处理（`Promise.allSettled`）
- ✅ 请求超时控制
- ✅ 错误隔离机制
- ✅ 内存管理优化
- ✅ 响应缓存支持

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 遵循 ESLint 配置
- 添加必要的注释
- 编写单元测试
- 更新相关文档

## 📝 许可证

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**

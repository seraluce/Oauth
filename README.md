# SSO Auth - 单点登录认证系统

基于 Next.js 16 App Router 构建的生产级单点登录（SSO）认证系统。

## 功能特性

### 认证系统
- 用户注册（用户名、邮箱、密码、6位邮箱验证码）
- 用户登录（Session Cookie + JWT 双重机制）
- 密码找回（邮箱验证码重置）
- 邮箱验证
- 账户锁定（5次失败后锁定15分钟）
- 自动6位ID生成（12000起，11000-11999预留给官方账号）

### 用户设置
- 个人资料管理（显示名称、头像）
- 安全设置（修改密码、2FA预留接口）
- 第三方账号绑定（GitHub、Google OAuth）
- 偏好设置（主题切换、语言、通知）

### 管理员后台
- 数据统计概览（用户数、活跃度、审计日志）
- 用户管理（搜索、分页、角色/状态变更）
- SSO 应用管理（创建和管理 OAuth2 应用）
- 系统设置

### SSO OAuth2 授权服务器
- 授权码模式（Authorization Code Grant）
- PKCE 支持（S256）
- Token 端点（授权码换取 + 刷新令牌）
- UserInfo 端点
- JWKS 公钥端点
- 令牌撤销

### 安全措施
- 频率限制（Redis 支持，内存回退）
- httpOnly + Secure + SameSite Cookie
- CSRF 防护（双重提交模式）
- bcryptjs 密码哈希（成本因子12）
- Zod 全端点输入验证
- 安全响应头（HSTS、CSP、X-Frame-Options、X-Content-Type-Options）
- SQL注入防护（Drizzle ORM 参数化查询）
- XSS防护（React 转义 + CSP）
- 全量审计日志
- 时间安全比较（防止计时攻击）
- 通用错误消息（防止枚举攻击）

### UI 设计
- Vercel/Next.js 官网风格扁平化线条UI
- 黑白灰主色调
- 深色模式支持
- 自适应响应式布局
- Lucide 线性图标（无emoji）

## 技术栈

| 技术 | 说明 |
|------|------|
| Next.js 16 | App Router, React 19 |
| TypeScript | 全量类型覆盖 |
| Drizzle ORM | SQLite / MySQL / PostgreSQL |
| Redis | 可选，内存回退 |
| jose | JWT 签发与验证 |
| bcryptjs | 密码哈希（纯JS，兼容Edge） |
| Zod | 输入验证 |
| Tailwind CSS v4 | 样式系统 |
| Lucide React | 线性图标库 |
| Nodemailer | 邮件发送 |
| next-themes | 主题切换 |

## 快速开始

### 环境要求
- Node.js >= 20.9.0
- npm >= 10

### 安装

```bash
# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env.local

# 推送数据库结构（SQLite）
npm run db:migrate

# 初始化管理员账号
npm run db:seed

# 启动开发服务器
npm run dev
```

### 默认管理员账号

| 字段 | 值 |
|------|-----|
| ID | 11000 |
| 邮箱 | admin@example.com |
| 密码 | admin123456 |

> 请在生产环境中立即修改管理员密码。

## 环境变量

```env
# 数据库（sqlite / mysql / postgres）
DB_DRIVER=sqlite
DATABASE_URL=file:./local.db

# Redis（可选，留空使用内存缓存）
REDIS_URL=

# 认证密钥
JWT_SECRET=<随机64字符字符串>
SESSION_SECRET=<随机64字符字符串>
BCRYPT_ROUNDS=12

# SSO OAuth2 服务器
SSO_ISSUER=http://localhost:3000
SSO_PRIVATE_KEY=          # RSA 私钥（PEM格式）
SSO_PUBLIC_KEY=           # RSA 公钥（PEM格式）

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# 邮件（console=控制台输出, smtp=真实发送）
EMAIL_MODE=console
EMAIL_FROM=noreply@example.com
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# 应用
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SSO Auth
NODE_ENV=development

# 安全
LOCKOUT_MAX_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15

# OAuth令牌加密密钥（32字节hex）
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

## 项目结构

```
src/
  app/
    (auth)/                  # 认证页面（登录/注册/找回密码）
    (app)/settings/          # 用户设置页面
    admin/                   # 管理员后台
    oauth/authorize/         # SSO 授权同意页
    api/
      auth/                  # 认证API（注册/登录/登出/密码重置等）
      user/                  # 用户API（资料/密码/设置/会话/OAuth绑定）
      admin/                 # 管理员API（用户管理/统计/设置）
      oauth/                 # SSO OAuth2 API（authorize/token/userinfo/jwks）
      health/                # 健康检查
  components/
    ui/                      # 基础UI组件
    auth/                    # 认证表单组件
    layout/                  # 布局组件（侧边栏/顶栏/主题切换）
    settings/                # 设置页面组件
    admin/                   # 管理后台组件
    providers/               # 上下文提供者
  lib/
    db/                      # 数据库（工厂模式 + Schema）
    redis/                   # 缓存层（Redis + 内存回退）
    auth/                    # 认证工具（JWT/密码/会话/ID生成/CSRF/频率限制）
    email/                   # 邮件服务
    sso/                     # SSO OAuth2 服务
    security/                # 安全工具（验证/清理/锁定）
    oauth-providers/         # 第三方OAuth（GitHub/Google）
    api/                     # API工具（处理器/响应/中间件）
    utils/                   # 通用工具
  hooks/                     # React Hooks
  types/                     # TypeScript 类型定义
  middleware.ts              # Edge 中间件（路由保护/安全头）
```

## API 接口文档

### 认证接口

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/api/auth/register` | 否 | 注册新用户 |
| POST | `/api/auth/login` | 否 | 用户登录 |
| POST | `/api/auth/logout` | 是 | 用户登出 |
| POST | `/api/auth/forgot-password` | 否 | 发送密码重置验证码 |
| POST | `/api/auth/reset-password` | 否 | 重置密码 |
| POST | `/api/auth/verify-email` | 否 | 验证邮箱 |
| POST | `/api/auth/resend-verification` | 否 | 重发验证码 |
| POST | `/api/auth/refresh` | 否 | 刷新访问令牌 |

### 用户接口

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/user/profile` | 是 | 获取用户资料 |
| PATCH | `/api/user/profile` | 是 | 更新用户资料 |
| POST | `/api/user/password` | 是 | 修改密码 |
| GET/PATCH | `/api/user/settings` | 是 | 获取/更新偏好设置 |
| GET | `/api/user/sessions` | 是 | 获取活跃会话列表 |
| DELETE | `/api/user/sessions` | 是 | 撤销指定会话 |
| POST | `/api/user/oauth/connect` | 是 | 发起OAuth绑定 |
| POST | `/api/user/oauth/disconnect` | 是 | 解除OAuth绑定 |

### 管理员接口

| 方法 | 路径 | 认证 | 角色 | 说明 |
|------|------|------|------|------|
| GET | `/api/admin/stats` | 是 | admin | 获取统计数据 |
| GET | `/api/admin/users` | 是 | admin | 用户列表（分页） |
| GET/PATCH | `/api/admin/users/[id]` | 是 | admin | 用户详情/更新 |

### SSO OAuth2 接口

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/oauth/authorize` | 是 | 授权同意页 |
| POST | `/api/oauth/authorize` | 是 | 批准/拒绝授权 |
| POST | `/api/oauth/token` | Client | 授权码换取令牌 |
| GET | `/api/oauth/userinfo` | Bearer | 获取授权用户信息 |
| POST | `/api/oauth/revoke` | 否 | 撤销令牌 |
| GET | `/api/oauth/jwks` | 否 | 公钥集合 |
| GET/POST | `/api/oauth/applications` | 是 | 应用列表/创建 |
| PATCH/DELETE | `/api/oauth/applications/[id]` | 是 | 更新/删除应用 |

### 响应格式

```json
// 成功
{ "success": true, "data": { ... }, "meta": { ... } }

// 失败
{ "success": false, "error": { "code": "ERROR_CODE", "message": "描述", "details": [...] } }
```

### SSO OAuth2 接入示例

第三方应用接入你的SSO系统：

```
1. 在管理后台创建应用，获取 client_id 和 client_secret

2. 引导用户访问：
   GET /api/oauth/authorize
     ?client_id=YOUR_CLIENT_ID
     &redirect_uri=https://yourapp.com/callback
     &response_type=code
     &scope=openid profile email
     &state=RANDOM_STATE
     &code_challenge=CHALLENGE
     &code_challenge_method=S256

3. 用户授权后，回调地址会收到 code 参数

4. 用 code 换取令牌：
   POST /api/oauth/token
     grant_type=authorization_code
     &code=AUTH_CODE
     &client_id=YOUR_CLIENT_ID
     &client_secret=YOUR_CLIENT_SECRET
     &redirect_uri=https://yourapp.com/callback
     &code_verifier=VERIFIER

5. 用 access_token 获取用户信息：
   GET /api/oauth/userinfo
     Authorization: Bearer ACCESS_TOKEN
```

## 数据库切换

### MySQL

```env
DB_DRIVER=mysql
DATABASE_URL=mysql://user:password@localhost:3306/sso_auth
```

### PostgreSQL

```env
DB_DRIVER=postgres
DATABASE_URL=postgresql://user:password@localhost:5432/sso_auth
```

切换数据库后需要重新生成 Schema 和迁移：

```bash
# 修改 drizzle.config.ts 中的 dialect
# 然后：
npm run db:generate
npm run db:migrate
npm run db:seed
```

## 部署

### Vercel

```bash
npm i -g vercel
vercel
```

在 Vercel 控制面板设置环境变量即可。

### Cloudflare Pages

```bash
npm i -g wrangler
npx @cloudflare/next-on-pages
wrangler pages deploy .vercel/output/static
```

> 注意：Cloudflare Pages 不支持本地 SQLite 文件，需使用远程数据库（如 Turso、Planetscale、Neon）。

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 开发命令

```bash
npm run dev              # 启动开发服务器
npm run build            # 生产构建
npm run start            # 启动生产服务器
npm run db:generate      # 生成迁移文件
npm run db:migrate       # 推送数据库结构
npm run db:seed          # 初始化数据
npm run db:studio        # 打开 Drizzle Studio 数据库管理界面
```

## 安全建议

1. **生产环境必须修改** `JWT_SECRET` 和 `SESSION_SECRET`
2. **启用 HTTPS**：生产环境设置 `NODE_ENV=production`
3. **配置 Redis**：多实例部署必须使用 Redis 共享会话和频率限制
4. **配置 SMTP**：生产环境设置 `EMAIL_MODE=smtp` 发送真实邮件
5. **配置 OAuth**：填写 GitHub/Google 的 Client ID 和 Secret
6. **RSA 密钥对**：SSO 令牌签名需要生成 RSA 密钥对并配置到环境变量
7. **定期轮换** JWT 密钥和 OAuth 应用密钥
8. **监控审计日志**：定期检查 `/api/admin/stats` 中的异常活动

## License

MIT

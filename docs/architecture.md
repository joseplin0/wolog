# Wolog 架构设计文档

> **版本：** v0.2.0 · **更新日期：** 2026-03-11 · **架构模式：** 微前端 + 微服务

---

## 1. 架构总览

```
┌────────────────── pnpm monorepo ──────────────────┐
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │        @wolog/main-app (Shell :5170)          │  │
│  │  ┌──────────┐  ┌───────────┐  ┌───────────┐  │  │
│  │  │ 动态侧栏  │  │ 认证守卫   │  │ wujie     │  │  │
│  │  │ (注册表)  │  │ (auth-sdk)│  │ 加载器    │  │  │
│  │  └──────────┘  └───────────┘  └─────┬─────┘  │  │
│  └─────────────────────────────────────┼────────┘  │
│                                         │           │
│         ┌──────────────┬────────────────┤           │
│         ▼              ▼                ▼           │
│  ┌────────────┐ ┌────────────┐  ┌────────────┐    │
│  │ @wolog/    │ │ @wolog/    │  │  外部子应用  │    │
│  │ app-auth   │ │ app-       │  │  (动态注册) │    │
│  │ :5171      │ │ timeline   │  │             │    │
│  │ (登录/注册)│ │ :5172      │  │             │    │
│  └──────┬─────┘ └────────────┘  └──────┬──────┘    │
│         │                              │           │
│         ▼                              ▼           │
│  ┌─────────────────────────────────────────────┐   │
│  │      @wolog/server (NestJS Fastify :3000)    │   │
│  │  ┌──────┐ ┌──────┐ ┌──────────┐ ┌────────┐ │   │
│  │  │ Auth │ │ User │ │ Registry │ │Gateway │ │   │
│  │  │Module│ │Module│ │ Module   │ │(代理)  │ │   │
│  │  └──┬───┘ └──────┘ └──────────┘ └────────┘ │   │
│  │     ▼                                        │   │
│  │  ┌──────────┐                                │   │
│  │  │ Prisma   │ ──→ SQLite (dev) / PG (prod)  │   │
│  │  └──────────┘                                │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────── 共享包 ──────┐                           │
│  │ @wolog/types        │  User, AuthTokens,        │
│  │ @wolog/auth-sdk     │  SubAppManifest, Guard    │
│  └─────────────────────┘                           │
└─────────────────────────────────────────────────────┘
```

## 2. 技术选型

| 维度 | 选型 | 理由 |
|------|------|------|
| **微前端** | wujie | iframe 沙箱天然 JS/CSS 隔离；子应用零改造可独立运行 |
| **后端** | NestJS (Fastify adapter) | Module/DI/Guard 机制对齐微服务架构；底层 Fastify 性能接近裸框架 |
| **构建编排** | pnpm workspaces | 原生 `--filter` / `-r` 足够当前规模，无需 Turborepo |
| **ORM** | Prisma | 类型安全、schema-first、一键切换 SQLite↔PostgreSQL |
| **认证** | JWT (access + refresh) | 无状态、跨子应用共享、@wolog/auth-sdk 统一封装 |
| **子应用注册** | API 动态注册 | 新增外部子应用 = 数据库插一条记录，前后端均无需改码 |

## 3. 目录结构

```
wolog/
├── packages/
│   ├── shared/                          # ─── 共享包 ───
│   │   ├── types/                       # @wolog/types
│   │   │   └── src/
│   │   │       ├── user.ts              #   User, AuthTokens, LoginDto
│   │   │       ├── app.ts               #   SubAppManifest 子应用契约
│   │   │       └── index.ts
│   │   └── auth-sdk/                    # @wolog/auth-sdk
│   │       └── src/
│   │           ├── auth-client.ts       #   JWT token 管理 + login/register
│   │           ├── auth-guard.ts        #   Vue Router 守卫 (支持 wujie)
│   │           ├── wujie.d.ts           #   wujie 全局类型声明
│   │           └── index.ts
│   │
│   ├── main-app/                        # ─── 主应用 Shell ───
│   │   └── src/
│   │       ├── micro/
│   │       │   ├── registry.ts          #   子应用注册表 (内置 + API 动态)
│   │       │   └── communication.ts     #   跨应用事件常量
│   │       ├── layout/
│   │       │   ├── MainShell.vue        #   主框架 (侧栏+内容区+事件监听)
│   │       │   └── SubAppContainer.vue  #   wujie 挂载容器
│   │       ├── router/index.ts          #   通配路由 + 认证守卫
│   │       ├── App.vue
│   │       └── main.ts
│   │
│   ├── apps/                            # ─── 子应用 ───
│   │   ├── auth/                        # @wolog/app-auth (内置)
│   │   │   └── src/
│   │   │       ├── views/LoginView.vue  #   登录/注册页
│   │   │       ├── App.vue
│   │   │       └── main.ts
│   │   └── timeline/                    # @wolog/app-timeline (从 MVP 迁移)
│   │       └── src/
│   │           ├── views/               #   TimelineView, CalendarView
│   │           ├── plugins/             #   插件系统 (note, expense)
│   │           ├── database/            #   Dexie.js (IndexedDB)
│   │           ├── stores/              #   Pinia stores
│   │           └── ...
│   │
│   └── server/                          # ─── NestJS 后端 ───
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/                #   JWT 注册/登录/策略/守卫
│       │   │   ├── user/                #   用户 CRUD
│       │   │   └── registry/            #   子应用注册表 API
│       │   ├── gateway/                 #   外部子应用后端代理 (Phase 2)
│       │   ├── prisma/prisma.service.ts
│       │   ├── app.module.ts
│       │   └── main.ts
│       └── prisma/schema.prisma         #   User + SubApp 表
│
├── templates/                           # ─── 外部子应用模板 ───
│   └── sub-app-template/
│       ├── frontend/
│       └── backend/
│
├── pnpm-workspace.yaml
├── package.json
└── .npmrc
```

## 4. 子应用注册契约

每个子应用通过 `SubAppManifest` 接口描述自己：

```typescript
interface SubAppManifest {
  id: string            // 唯一标识, 如 'timeline'
  name: string          // 显示名称, 如 '时间轴'
  icon: string          // 图标 (emoji 或 icon class)
  entry: string         // 前端入口 URL
  activeRule: string    // 路由匹配规则, 如 '/app/timeline'
  requireAuth?: boolean // 是否需要登录 (默认 true)
  builtIn?: boolean     // 是否内置子应用
  backendUrl?: string   // 后端 URL (外部子应用, 网关代理用)
}
```

**内置子应用** — 写在 `registry.ts` 的 `builtInApps` 数组中。
**外部子应用** — 通过 `GET /api/apps/registry` 从数据库动态加载，无需改码。

## 5. 子应用加载流程

```
用户访问 /app/timeline
       │
       ▼
  主应用路由守卫
       │
       ▼
  检查 requireAuth ── 未登录 ──→ 跳转 /app/auth/login?redirect=...
       │
     已登录
       │
       ▼
  SubAppContainer.vue
       │
       ▼
  <WujieVue
    name="timeline"
    url="http://localhost:5172"
    :props="{ token, user }"
  />
```

## 6. 跨应用通信

基于 wujie 内置的 EventBus：

| 事件 | 方向 | 用途 |
|------|------|------|
| `auth:required` | 子应用 → 主应用 | 子应用发现未登录，请求跳转登录 |
| `auth:logout` | 子应用 → 主应用 | 子应用请求登出 |
| `auth:success` | Auth → 主应用 | 登录成功，回跳来源页 |
| `app:navigate` | 子应用 → 主应用 | 跨应用路由跳转 |
| `props` | 主应用 → 子应用 | 传递 token、user 信息 |

## 7. 中心化 API Registry (能力共享大厅)

为避免中心化（主应用包揽所有方法）导致代码臃肿，Wolog 采用**中心化 API 注册表**方案供各微应用互相共享能力。主应用仅提供 `window.wolog.api` 容器，具体能力由对应子应用自行注册。

**契约声明（在 `@wolog/types`）：**
```typescript
interface WologGlobalApi {
  auth?: { toLoginByDirect: (redirect?: string) => void; };
  timeline?: { refreshDailyLog: (date: string) => Promise<void>; };
  shell: { showToast: (msg: string) => void; }
}

declare global {
  interface Window {
    wolog: {
      api: Partial<WologGlobalApi>;
      registerApi: <K extends keyof WologGlobalApi>(ns: K, apis: WologGlobalApi[K]) => void;
    }
  }
}
```

**主应用初始化集线器：**
```typescript
// main.ts
window.wolog = {
  api: { shell: { showToast: (msg) => console.log(msg) } }, // 仅注册 Shell 能力
  registerApi: (ns, apis) => { window.wolog.api[ns] = { ...window.wolog.api[ns], ...apis } }
}
```

**子应用注册能力（以 Auth 为例）：**
```typescript
// Auth 子应用初始化时
const rootWindow = window.$wujie ? window.parent : window;
rootWindow.wolog?.registerApi('auth', {
  toLoginByDirect: (redirect) => { router.push(`/login?redirect=${redirect}`) }
});
```

**其他应用调用：**
```typescript
const rootWindow = window.$wujie ? window.parent : window;
// auth 可能尚未加载，所以用可选链 `.?` 保证安全
rootWindow.wolog.api.auth?.toLoginByDirect('/app/timeline');
```

## 8. 外部子应用接入规范

| 要求 | 说明 |
|------|------|
| 独立可运行 | 标准 SPA，`npm run dev` 能独立启动 |
| CORS | dev 模式 Vite 配置 `server.cors: true` |
| 认证 | 安装 `@wolog/auth-sdk`，使用 `createAuthGuard()` |
| 注册 | 调用 `POST /api/apps/register` 或直接写数据库 |
| 后端自由 | 技术栈不限，Gateway 模块按注册表动态代理 |

## 9. 服务端口规划

| 服务 | 端口 | 说明 |
|------|------|------|
| NestJS Server | 3000 | API 网关 + 内置模块 |
| Main App (Shell) | 5170 | 微前端主应用 |
| Auth 子应用 | 5171 | 登录/注册 |
| Timeline 子应用 | 5172 | 时间轴/日历 |
| 外部子应用 | 5173+ | 按需分配 |

## 10. 常用命令

```bash
# 全量启动（所有应用并行）
pnpm dev

# 单独启动
pnpm dev:server     # NestJS 后端
pnpm dev:main       # 主应用 Shell
pnpm dev:auth       # Auth 子应用
pnpm dev:timeline   # Timeline 子应用
pnpm dev:frontend   # 全部前端（不含 server）

# Prisma 数据库
cd packages/server
npx prisma studio    # 可视化管理
npx prisma db push   # 同步 schema
npx prisma generate  # 生成 client

# 构建
pnpm build           # 全量构建
```

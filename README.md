# Easy Proxy

> 🔄 本地 HTTP 代理管理桌面应用 — 前端开发中切换后端地址无需重启项目

[English](README.en.md)

---

## 简介

**Easy Proxy** 是一款 Windows 桌面应用（基于 Electron），提供可视化的本地 HTTP/HTTPS 代理管理。当前端项目需要切换后端目标地址（如开发环境 → 测试环境 → 生产环境）时，无需重启前端项目，只需在 Easy Proxy 中一键切换即可。

同时内置 **MCP Server**，支持 AI 助手（Claude、Cursor、VS Code Copilot）通过自然语言管理代理。

## 功能特性

- **代理项目管理** — 创建、编辑、删除代理项目，为每个项目配置多个目标地址
- **代理服务控制** — 一键启动/停止/重启代理转发服务
- **热切换目标** — 运行时切换转发地址，无需重启
- **自动端口分配** — 从 10000-60000 范围内自动分配可用端口
- **多配置支持** — 每个项目支持多个子配置（目标地址 + 自定义 Headers）
- **AI 助手集成** — 内嵌 MCP Server，10 个工具供 AI 调用
- **Cookie 管理** — 支持为代理请求注入自定义 Cookie
- **WebSocket 代理** — 支持 WebSocket 连接的代理转发
- **Desktop 打包** — Electron 打包为原生 Windows .exe，NSIS 安装器

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 桌面壳 | Electron | 42.x |
| 后端框架 | NestJS (Express) | 11.x |
| 前端框架 | React | 19.x |
| UI 组件库 | Ant Design | 6.x |
| 代理中间件 | http-proxy-middleware | 3.x |
| 数据存储 | lowdb (JSON 文件) | 7.x |
| MCP SDK | @modelcontextprotocol/sdk | 1.x |
| 前端构建 | Vite | 8.x |
| 打包工具 | electron-builder | 26.x |
| 容器化 | Docker | — |

## 项目结构

```
proxy-app/
├── proxy-ui/                  # React 前端 (Vite + Ant Design)
│   ├── src/
│   │   ├── pages/             # HomeList (主页), Edit (编辑页)
│   │   ├── components/        # Layout, MockToggle, NavigateComponent
│   │   ├── api/               # Axios 封装 + 全部 API 函数
│   │   └── mock/              # Mock 模式 (离线开发)
│   └── vite.config.js
│
├── proxy-backend/             # NestJS 后端 + Electron 打包
│   ├── src/
│   │   ├── project/           # 项目管理 (CRUD + 代理控制)
│   │   ├── proxy/             # 核心代理引擎
│   │   ├── storage/           # lowdb 数据持久化
│   │   └── mcp/               # MCP 工具定义 (10 tools)
│   ├── electron/              # Electron 主进程 + preload
│   ├── scripts/               # 构建脚本 (copy-ui.cjs)
│   └── package.json           # 主应用配置 (含 electron-builder)
│
├── scripts/
│   └── release.ps1            # 一键发布脚本
│
├── Dockerfile                 # 多阶段构建 (UI + Backend)
├── docker-compose.yml         # Docker 构建服务
└── .claude/
    ├── mcp.json               # Claude Code MCP 连接配置
    └── skills/                # Claude 技能
        ├── release.md         # 发布流程
        └── quick-create-project.md  # 快速创建项目
```

## 前置要求

- **Node.js** >= 20
- **npm** >= 10
- **Docker Desktop** (构建和发布时需要)
- **PowerShell** (发布脚本)

## 快速开始 (开发)

```bash
# 1. 克隆仓库
git clone https://github.com/liar177/proxy-app-fork.git
cd proxy-app

# 2. 安装依赖
cd proxy-backend && npm install
cd ../proxy-ui && npm install
cd ..

# 3. 启动后端 (http://localhost:3000)
cd proxy-backend
npm run start:dev

# 4. 另开终端，启动前端 (http://localhost:5173)
cd proxy-ui
npm run dev
```

前端 Vite 开发服务器自动将 `/api-proxy` 请求代理到 `localhost:3000`。

## 构建与打包

```bash
# Docker 可复现构建 (编译 UI + Backend)
docker compose build builder

# 提取产物
docker create --name tmp-release easy-proxy-builder:latest
docker cp tmp-release:/app/proxy-backend/dist ./proxy-backend/dist
docker rm tmp-release

# 打包为 Windows .exe
cd proxy-backend
npx electron-builder --win
# 产物在 release/ 目录
```

## 发布新版本

```powershell
# 前提: Docker 运行, 设置 GitHub Token
$env:PROXY_APP_GITHUB_TOKEN="ghp_xxxxxxxx"

# 一键发布
.\scripts\release.ps1 v1.0.0

# 或使用 Claude 技能
/release
```

脚本自动完成: **Docker 构建 → 提取产物 → 同步版本号 → electron-builder 打包 → GitHub Releases 上传**

## MCP 集成

Easy Proxy 内嵌 MCP Server，AI 助手可通过以下 10 个工具管理代理：

| 工具 | 功能 |
|------|------|
| `list_projects` | 列出所有项目 |
| `get_project` | 获取项目详情 |
| `create_project` | 创建代理项目 |
| `update_project` | 修改项目配置 |
| `delete_project` | 删除项目 |
| `start_proxy` | 启动代理 |
| `stop_proxy` | 停止代理 |
| `restart_proxy` | 重启代理 |
| `switch_config` | 热切换目标地址 |
| `get_cookie` | 获取模拟 Cookie |

**Claude Code 配置** (`.claude/mcp.json`):

```json
{
  "mcpServers": {
    "proxy-mcp-server": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

## 架构

```
用户双击 Easy Proxy.exe
  └─ Electron 主进程启动
       ├─ 自动扫描可用端口 (3000-3100)
       ├─ 启动 NestJS 子进程
       └─ 打开 BrowserWindow 加载前端页面

用户启动代理:
  └─ proxy.service.ts 创建独立 HTTP Server
       └─ http-proxy-middleware 转发请求到目标地址
            ├─ 自动添加 CORS 头
            ├─ 注入自定义 Headers/Cookie
            └─ 支持 WebSocket 升级
```

## License

ISC

# Easy Proxy

> 🔄 Local HTTP proxy management desktop app — switch backend endpoints without restarting your frontend project

[中文](README.md)

---

## Overview

**Easy Proxy** is a Windows desktop application (based on Electron) that provides visual management of local HTTP/HTTPS proxies. When a frontend project needs to switch backend endpoints (e.g., dev → staging → production), there's no need to restart the frontend dev server — just switch the target in Easy Proxy with one click.

It also features an embedded **MCP Server**, enabling AI assistants (Claude, Cursor, VS Code Copilot) to manage proxies via natural language.

## Features

- **Proxy Project Management** — Create, edit, delete proxy projects with multiple target configurations
- **Proxy Server Control** — Start/stop/restart proxy forwarding services with one click
- **Hot-Switch Targets** — Switch forwarding destinations at runtime without restart
- **Auto Port Allocation** — Automatically assign available ports from the 10000-60000 range
- **Multi-Config Support** — Each project supports multiple sub-configs (target address + custom headers)
- **AI Assistant Integration** — Embedded MCP Server with 10 tools for AI-driven management
- **Cookie Management** — Inject custom cookies into proxied requests
- **WebSocket Proxy** — Support for WebSocket connection forwarding
- **Desktop Packaging** — Native Windows .exe with NSIS installer via Electron

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Desktop Shell | Electron | 42.x |
| Backend | NestJS (Express) | 11.x |
| Frontend | React + Ant Design | 19.x / 6.x |
| Proxy Engine | http-proxy-middleware | 3.x |
| Data Storage | lowdb (JSON file) | 7.x |
| MCP SDK | @modelcontextprotocol/sdk | 1.x |
| Frontend Build | Vite | 8.x |
| Packaging | electron-builder | 26.x |
| Containerization | Docker | — |

## Project Structure

```
proxy-app/
├── proxy-ui/                  # React frontend (Vite + Ant Design)
│   ├── src/
│   │   ├── pages/             # HomeList, Edit
│   │   ├── components/        # Layout, MockToggle, NavigateComponent
│   │   ├── api/               # Axios instance + API functions
│   │   └── mock/              # Mock mode (offline development)
│   └── vite.config.js
│
├── proxy-backend/             # NestJS backend + Electron packaging
│   ├── src/
│   │   ├── project/           # Project management (CRUD + proxy control)
│   │   ├── proxy/             # Core proxy engine
│   │   ├── storage/           # lowdb data persistence
│   │   └── mcp/               # MCP tool definitions (10 tools)
│   ├── electron/              # Electron main process + preload
│   ├── scripts/               # Build scripts (copy-ui.cjs)
│   └── package.json           # Main app config (incl. electron-builder)
│
├── scripts/
│   └── release.ps1            # One-click release script
│
├── Dockerfile                 # Multi-stage build (UI + Backend)
├── docker-compose.yml         # Docker builder service
└── .claude/
    ├── mcp.json               # Claude Code MCP connection config
    └── skills/                # Claude skills
        ├── release.md         # Release workflow
        └── quick-create-project.md  # Quick project creation
```

## Prerequisites

- **Node.js** >= 20
- **npm** >= 10
- **Docker Desktop** (for build & release)
- **PowerShell** (for release script)

## Quick Start (Development)

```bash
# 1. Clone
git clone https://github.com/liar177/proxy-app-fork.git
cd proxy-app

# 2. Install dependencies
cd proxy-backend && npm install
cd ../proxy-ui && npm install
cd ..

# 3. Start backend (http://localhost:3000)
cd proxy-backend
npm run start:dev

# 4. Start frontend (new terminal)
cd proxy-ui
npm run dev                # http://localhost:5173
```

Vite dev server proxies `/api-proxy` requests to `localhost:3000` automatically.

## Build & Package

```bash
# Docker reproducible build (compiles UI + Backend)
docker compose build builder

# Extract artifacts
docker create --name tmp-release easy-proxy-builder:latest
docker cp tmp-release:/app/proxy-backend/dist ./proxy-backend/dist
docker rm tmp-release

# Package as Windows .exe
cd proxy-backend
npx electron-builder --win
# Output: release/ directory
```

## Release

```powershell
# Prerequisites: Docker running, set GitHub Token
$env:PROXY_APP_GITHUB_TOKEN="ghp_xxxxxxxx"

# One-click release
.\scripts\release.ps1 v1.0.0

# Or use Claude skill
/release
```

The script automates: **Docker build → extract artifacts → sync version → electron-builder → GitHub Releases upload**

## MCP Integration

Easy Proxy embeds an MCP server with 10 tools for AI assistants:

| Tool | Description |
|------|-------------|
| `list_projects` | List all proxy projects |
| `get_project` | Get project details |
| `create_project` | Create a proxy project |
| `update_project` | Update project config |
| `delete_project` | Delete a project |
| `start_proxy` | Start proxy forwarding |
| `stop_proxy` | Stop proxy forwarding |
| `restart_proxy` | Restart proxy |
| `switch_config` | Hot-switch target address |
| `get_cookie` | Get simulated cookie |

**Claude Code config** (`.claude/mcp.json`):

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

## Architecture

```
User launches Easy Proxy.exe
  └─ Electron main process starts
       ├─ Auto-scans for available port (3000-3100)
       ├─ Starts NestJS as child process
       └─ Opens BrowserWindow loading the UI

User starts a proxy:
  └─ proxy.service.ts creates standalone HTTP Server
       └─ http-proxy-middleware forwards requests to target
            ├─ Adds CORS headers automatically
            ├─ Injects custom headers/cookies
            └─ Supports WebSocket upgrade
```

## License

ISC

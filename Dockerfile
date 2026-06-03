# ============================================================
# Dockerfile — Easy Proxy 可复现构建
# 只负责 Node.js 编译（Vite + NestJS），不包含 electron-builder
# electron-builder 在 Windows host 上执行
# ============================================================

# ---------- Stage 1: 构建 proxy-ui (React + Vite) ----------
FROM node:20-alpine AS ui-builder
WORKDIR /app/proxy-ui

# 利用 Docker 层缓存：先装依赖，再拷源码
COPY proxy-ui/package.json proxy-ui/package-lock.json ./
RUN npm ci

COPY proxy-ui/ ./
RUN npm run build

# ---------- Stage 2: 构建 proxy-backend (NestJS) ----------
FROM node:20-alpine AS backend-builder
WORKDIR /app/proxy-backend

COPY proxy-backend/package.json proxy-backend/package-lock.json ./
RUN npm ci --legacy-peer-deps

# 复制前端产物到 public/（替代 copy-ui.cjs 的功能）
COPY --from=ui-builder /app/proxy-ui/dist ./public/

# 复制后端源码和配置
COPY proxy-backend/nest-cli.json proxy-backend/tsconfig.json ./
COPY proxy-backend/src/ ./src/
COPY proxy-backend/electron/ ./electron/

# NestJS 编译
RUN npm run build:backend

# 最终产物：
#   /app/proxy-backend/dist/   → NestJS 编译输出（含 public/）
#   electron/ 和 package.json 供 electron-builder 使用

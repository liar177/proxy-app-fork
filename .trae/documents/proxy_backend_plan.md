
# Proxy-Backend 后端服务实现计划

## 1. 项目概述

根据需求，需要创建一个 NestJS 后端服务，为 proxy-ui 提供 API 接口并实现代理功能。

### 技术架构
```
[Electron 壳]
  └─ 主进程启动 Node.js 子进程 → [NestJS 服务]
       ├─ 提供 REST API (供 proxy-ui 调用)
       ├─ 托管 proxy-ui 静态文件
       ├─ 内置 HTTP 代理中间件 (http-proxy-middleware)
       └─ 数据存储 (lowdb / JSON 文件)
```

## 2. 需求分析

### 2.1 数据模型

根据 proxy-ui 的 mock 数据，项目配置结构如下：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 项目唯一标识 |
| name | string | 项目名称 |
| config | string | 配置文件名称 |
| address | string | 本地代理地址 (http://localhost:port) |
| destination | string | 目标服务器地址 |
| status | string | 状态 (running/stopped/reloading) |
| description | string | 项目描述 |
| port | number | 本地监听端口 |
| configs | array | 配置列表 |

### 2.2 API 接口需求

| API 路径 | 方法 | 功能 |
|----------|------|------|
| /project/list | POST | 获取项目列表（支持搜索） |
| /project/info | POST | 获取项目详情 |
| /project/create | POST | 创建新项目 |
| /project/modify | POST | 修改项目信息 |
| /project/delete | POST | 删除项目 |
| /project/checkProjectName | POST | 检查项目名称是否存在 |
| /project/requestProjectPort | POST | 请求可用端口 |
| /project/switchConfig | POST | 切换配置目标地址 |
| /project/action/start | POST | 启动代理服务 |
| /project/action/stop | POST | 停止代理服务 |
| /project/action/restart | POST | 重启代理服务 |
| /project/action/getCookie | POST | 获取 Cookie |

## 3. 实现计划

### 3.1 任务分解

| 序号 | 任务名称 | 描述 | 依赖 |
|------|----------|------|------|
| 1 | 项目初始化 | 使用 Nest CLI 创建项目 | - |
| 2 | 安装依赖 | 安装必要依赖包 | 任务1 |
| 3 | 配置数据存储 | 配置 lowdb 进行数据持久化 | 任务2 |
| 4 | 创建项目模块 | 创建 Project 模块和控制器 | 任务3 |
| 5 | 实现 CRUD API | 实现项目增删改查接口 | 任务4 |
| 6 | 实现代理功能 | 集成 http-proxy-middleware | 任务4 |
| 7 | 配置静态资源托管 | 托管 proxy-ui 静态文件 | 任务2 |
| 8 | 测试验证 | 启动服务测试接口 | 任务5-7 |

### 3.2 文件结构

```
proxy-backend/
├── src/
│   ├── app.module.ts          # 主应用模块
│   ├── main.ts                # 入口文件
│   ├── project/               # 项目模块
│   │   ├── project.module.ts  # 模块定义
│   │   ├── project.controller.ts  # 控制器
│   │   ├── project.service.ts     # 业务逻辑
│   │   ├── project.entity.ts      # 数据模型
│   │   └── dto/                   # 数据传输对象
│   │       ├── create-project.dto.ts
│   │       ├── update-project.dto.ts
│   │       └── project-query.dto.ts
│   ├── proxy/                 # 代理模块
│   │   ├── proxy.module.ts
│   │   └── proxy.service.ts   # 代理服务管理
│   ├── storage/               # 数据存储模块
│   │   ├── storage.module.ts
│   │   └── storage.service.ts # lowdb 封装
│   └── public/                # 静态资源目录（proxy-ui build产物）
├── package.json
├── nest-cli.json
├── tsconfig.json
└── data/                      # 数据文件目录
    └── db.json
```

### 3.3 关键实现要点

#### 3.3.1 数据存储
- 使用 lowdb 作为轻量级 JSON 数据库
- 数据文件存储在 data/db.json
- 实现 StorageService 封装数据库操作

#### 3.3.2 代理服务
- 使用 http-proxy-middleware 实现反向代理
- 每个项目独立启动一个代理服务器
- 支持 HTTP 和 HTTPS 代理

#### 3.3.3 静态资源托管
- NestJS 内置静态资源服务
- 将 proxy-ui 构建产物放置在 public 目录
- 配置路由转发

## 4. 依赖清单

| 依赖名称 | 版本 | 用途 |
|----------|------|------|
| @nestjs/common | ^10.0.0 | NestJS 核心模块 |
| @nestjs/core | ^10.0.0 | NestJS 核心模块 |
| @nestjs/platform-express | ^10.0.0 | Express 平台 |
| reflect-metadata | ^0.1.13 | 反射元数据 |
| rxjs | ^7.8.1 | 响应式编程 |
| lowdb | ^6.0.0 | JSON 数据库 |
| http-proxy-middleware | ^2.0.6 | HTTP 代理中间件 |
| @types/node | ^20.0.0 | Node.js 类型定义 |
| typescript | ^5.0.0 | TypeScript |

## 5. 风险与注意事项

### 5.1 端口冲突
- 启动代理前检查端口是否被占用
- requestProjectPort 接口确保返回未使用的端口

### 5.2 并发控制
- 同一项目同时只能有一个代理实例运行
- 使用状态字段进行控制

### 5.3 数据一致性
- 修改配置后需要重启代理才能生效
- 停止代理时正确清理资源

### 5.4 错误处理
- 完善的错误捕获和日志记录
- 统一的错误响应格式

## 6. 输出与交付

完成后将生成：
- proxy-backend 目录下完整的 NestJS 项目
- package.json 包含必要依赖
- 所有 API 接口实现
- 数据持久化功能
- 代理服务功能
- 静态资源托管配置

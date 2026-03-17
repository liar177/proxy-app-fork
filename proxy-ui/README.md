# Proxy UI

Proxy UI 是一个用于构建 Windows 桌面端应用的用户界面，旨在解决前端开发过程中代理地址切换需重启服务的问题，实现本地 Web 前端项目启动后自动代理 HTTP/HTTPS 请求至目标服务器的功能。

## 技术栈

- React 19.2.4
- Ant Design 6.3.3
- React Router 7.13.1
- Vite 8.0.0

## 项目结构

```
proxy-ui/
├── public/            # 静态资源
├── src/
│   ├── components/    # 组件
│   ├── pages/         # 页面
│   ├── services/      # 服务
│   ├── utils/         # 工具函数
│   ├── assets/        # 资源文件
│   ├── App.jsx        # 应用入口组件
│   ├── main.jsx       # 应用渲染入口
│   ├── App.css        # 应用样式
│   └── index.css      # 全局样式
├── .gitignore         # Git 忽略文件
├── eslint.config.js   # ESLint 配置
├── index.html         # HTML 模板
├── package.json       # 项目配置和依赖
├── package-lock.json  # 依赖版本锁定
└── vite.config.js     # Vite 配置
```

## 环境搭建

1. **克隆项目**
   ```bash
   git clone <项目地址>
   cd proxy-ui
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

## 开发环境

启动开发服务器：
```bash
npm run dev
```

开发服务器将在 http://localhost:5173/ 运行，支持热重载。

## 生产环境构建

构建生产版本：
```bash
npm run build
```

构建产物将生成在 `dist` 目录中。

## 预览生产构建

预览生产构建结果：
```bash
npm run preview
```

## 代码检查

运行 ESLint 检查代码：
```bash
npm run lint
```

## 功能说明

- **首页**：展示应用的基本信息和功能介绍
- **设置页面**：配置代理服务器地址、端口等参数

## 后续开发计划

- 实现与 NestJS 后端服务的集成
- 添加更多代理配置选项
- 实现代理状态监控和日志查看
- 开发桌面端应用打包功能

## 注意事项

- 确保所有依赖版本为当前最新稳定版
- 代码应遵循 React 最佳实践和 Ant Design 组件使用规范
- 工程具有良好的可扩展性，便于后续功能开发

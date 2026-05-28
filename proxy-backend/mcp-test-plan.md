# MCP 功能测试方案

## 测试环境准备

```bash
# 1. 启动 proxy-backend
cd proxy-backend
npm run start:dev

# 2. 确认服务就绪 — 访问 http://localhost:3000/mcp 应返回非 404
```

## 第一层：MCP 协议握手测试（curl）

验证 MCP 协议层面的 initialize → tools/list → tools/call 完整链路。

```bash
# 1.1 初始化连接，获取 sessionId
curl -s -D - -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'

# 预期：返回 serverInfo，响应头包含 mcp-session-id
```

```
✅ 通过条件：HTTP 200，响应体含 "proxy-mcp-server"，有 mcp-session-id 头
```

```bash
# 1.2 获取工具列表
# （用上一步的 sessionId 替换 SESSION_ID）
curl -s -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: SESSION_ID" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

```
✅ 通过条件：返回 10 个工具，名称与预期一致：
   list_projects, get_project, create_project, update_project,
   delete_project, start_proxy, stop_proxy, restart_proxy,
   switch_config, get_cookie
```

## 第二层：工具功能测试（curl）

按 CRUD 顺序验证每个工具，**不需要真实代理目标**。

### 2.1 查询（Read）

```bash
# 2.1.1 列出所有项目
curl ... -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_projects","arguments":{}}}'
```
```
✅ 预期：返回项目数组（可能为空），无报错
```

```bash
# 2.1.2 按名称搜索
curl ... -d '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"list_projects","arguments":{"name":"test"}}}'
```
```
✅ 预期：只返回名称包含 "test" 的项目
```

```bash
# 2.1.3 获取不存在的项目
curl ... -d '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"get_project","arguments":{"id":999}}}'
```
```
✅ 预期：返回 "项目不存在"
```

### 2.2 创建（Create）

```bash
# 2.2.1 创建项目
curl ... -d '{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"create_project","arguments":{"name":"test-project","port":18080,"description":"MCP测试项目","configs":[{"targetAddress":"https://httpbin.org"}]}}}'
```
```
✅ 预期：返回完整的项目对象，id 自动分配，status 为 "stopped"，address 为 "http://localhost:18080"
```

```bash
# 2.2.2 创建重名项目（验证唯一性约束）
curl ... -d '{"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"create_project","arguments":{"name":"test-project","port":18081,"description":"重复名称"}}}'
```
```
✅ 预期：返回 "创建失败：项目名称已存在"
```

```bash
# 2.2.3 参数校验：缺少必填字段 name
curl ... -d '{"jsonrpc":"2.0","id":8,"method":"tools/call","params":{"name":"create_project","arguments":{"port":18082}}}'
```
```
✅ 预期：返回参数校验错误（Zod validation）
```

### 2.3 获取详情

```bash
# 2.3.1 获取刚创建的项目（id 为上一步的返回值）
curl ... -d '{"jsonrpc":"2.0","id":9,"method":"tools/call","params":{"name":"get_project","arguments":{"id":1}}}'
```
```
✅ 预期：返回完整项目信息，包含 configs 数组
```

### 2.4 修改（Update）

```bash
# 2.4.1 修改项目描述和目标地址
curl ... -d '{"jsonrpc":"2.0","id":10,"method":"tools/call","params":{"name":"update_project","arguments":{"id":1,"name":"test-project-updated","port":18080,"description":"更新后的描述","configs":[{"targetAddress":"https://jsonplaceholder.typicode.com"}]}}}'
```
```
✅ 预期：返回更新后的项目对象，name 和 description 已变
```

### 2.5 代理控制

```bash
# 2.5.1 启动代理（目标地址需真实可达）
curl ... -d '{"jsonrpc":"2.0","id":11,"method":"tools/call","params":{"name":"start_proxy","arguments":{"id":1}}}'
```
```
✅ 预期：返回 "代理已启动"，服务端日志显示 Proxy server started
```

```bash
# 2.5.2 验证代理是否生效
curl -s http://localhost:18080/get  # 请求 httpbin 的 /get 端点
```
```
✅ 预期：返回 httpbin 的响应，说明代理转发正常工作
```

```bash
# 2.5.3 热切换目标地址
curl ... -d '{"jsonrpc":"2.0","id":12,"method":"tools/call","params":{"name":"switch_config","arguments":{"id":1,"destination":"https://jsonplaceholder.typicode.com"}}}'
```
```
✅ 预期：返回 "目标地址已切换...请重启代理使其生效"
```

```bash
# 2.5.4 重启代理使新配置生效
curl ... -d '{"jsonrpc":"2.0","id":13,"method":"tools/call","params":{"name":"restart_proxy","arguments":{"id":1}}}'
```
```
✅ 预期：返回 "代理已重启"
```

```bash
# 2.5.5 停止代理
curl ... -d '{"jsonrpc":"2.0","id":14,"method":"tools/call","params":{"name":"stop_proxy","arguments":{"id":1}}}'
```
```
✅ 预期：返回 "代理已停止"
```

### 2.6 删除（Delete）

```bash
# 2.6.1 删除项目
curl ... -d '{"jsonrpc":"2.0","id":15,"method":"tools/call","params":{"name":"delete_project","arguments":{"id":1}}}'
```
```
✅ 预期：返回 "项目 1 已删除"
```

```bash
# 2.6.2 确认删除后列表变化
curl ... -d '{"jsonrpc":"2.0","id":16,"method":"tools/call","params":{"name":"list_projects","arguments":{}}}'
```
```
✅ 预期：已删除的项目不再出现
```

## 第三层：MCP Inspector 验证（官方测试工具）

MCP Inspector 是 MCP 官方的调试工具，可以图形化测试所有工具。

```bash
# 安装并启动 Inspector
npx @modelcontextprotocol/inspector

# 在 Inspector 界面中输入：
# Transport Type: Streamable HTTP
# URL: http://localhost:3000/mcp
# 点击 Connect
```

```
✅ 通过条件：
   - Inspector 成功连接，显示工具列表
   - 可以逐个调用工具并查看返回结果
   - 参数 Schema 显示正常（Zod schema → JSON Schema 转换）
```

## 第四层：AI 客户端集成验证（可选）

如果有 Claude Desktop、Cursor、VS Code Copilot 等支持 MCP 的客户端：

```json
{
  "mcpServers": {
    "proxy-app": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

```
✅ 通过条件：AI 客户端能发现工具，对话中能调用并获取正确结果
```

## 第五层：边界和异常测试

| 测试场景 | 输入 | 预期 |
|----------|------|------|
| 启动不存在的代理 | `start_proxy(id=999)` | 返回 "启动失败" |
| 停止未运行的代理 | `stop_proxy(id=1)` | 返回 "停止失败" |
| 切换不存在的项目配置 | `switch_config(id=999, ...)` | 返回 "切换失败" |
| 重复启动同一代理 | `start_proxy(id=1)` 两次 | 第二次返回 "启动失败：代理已在运行" |
| 无效目标地址 | `create_project(port=18080, configs=[{targetAddress:"not-a-url"}])` → `start_proxy` | 启动失败 |
| 并发请求 | 同时发 5 个 `list_projects` | 全部正常返回 |

## 测试总结 checklist

```
□ 1.1  初始化握手成功，获取 sessionId
□ 1.2  工具列表返回 10 个工具
□ 2.1.1 列出项目成功
□ 2.1.2 名称搜索过滤正常
□ 2.1.3 查询不存在的项目返回友好提示
□ 2.2.1 创建项目成功
□ 2.2.2 重名校验生效
□ 2.2.3 参数校验生效
□ 2.3.1 获取项目详情正确
□ 2.4.1 修改项目成功
□ 2.5.1 启动代理成功
□ 2.5.2 代理转发生效
□ 2.5.3 热切换配置成功
□ 2.5.4 重启代理成功
□ 2.5.5 停止代理成功
□ 2.6.1 删除项目成功
□ 2.6.2 删除后列表正确
□ 3   MCP Inspector 通过
□ 5   边界异常处理正确
```

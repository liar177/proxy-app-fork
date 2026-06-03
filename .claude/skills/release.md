---
name: release
description: 发布新版本：打 git tag + 一键构建打包上传到 GitHub Releases
---

# 发布新版本

当用户请求"发布新版本"、"release"、"打包发布"等时，按以下流程操作。

## 前置检查

1. 确认工作区干净（`git status`），有未提交的改动提醒用户先提交
2. 确认 Docker Desktop 在运行
3. 确认 `PROXY_APP_GITHUB_TOKEN` 环境变量已设置（否则提醒用户设置）

## 流程

### 1. 确定版本号

查看当前最新 git tag：
```bash
git describe --tags --abbrev=0
```

向用户展示当前版本，并建议新版本号（例如当前 v1.0.0 → 建议 v1.1.0 或 v1.0.1）。

用 `AskUserQuestion` 询问：
- **新版本号**（如 v1.1.0）
- **变更为 semver 的哪个级别**（major / minor / patch），默认 patch

如果用户直接说了版本号则跳过询问。

### 2. 打 tag 并推送

```bash
git tag <版本号>
git push origin <版本号>
```

### 3. 执行发布

用 PowerShell 运行发布脚本：
```bash
powershell.exe -ExecutionPolicy Bypass -File scripts/release.ps1 <版本号>
```

将结果（版本号、Release URL、下载链接）展示给用户。

### 4. 恢复 package.json

发布后 `proxy-backend/package.json` 的 version 字段会被脚本修改，将其恢复：
```bash
git checkout proxy-backend/package.json
```

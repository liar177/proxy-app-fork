# ============================================================
# release.ps1 — Easy Proxy 一键发布脚本
#
# 流程：
#   1) 读取 git tag 作为版本号
#   2) Docker 可复现编译 UI + Backend
#   3) 提取产物到 host
#   4) electron-builder 打包 .exe
#   5) 发布到 GitHub Releases
#
# 前置条件（二选一）：
#   - 方式 A: 安装 GitHub CLI (gh) 并登录  →  gh auth login
#   - 方式 B: 设置环境变量 PROXY_APP_GITHUB_TOKEN  →  $env:PROXY_APP_GITHUB_TOKEN="ghp_xxx"
#             (去 https://github.com/settings/tokens 生成，勾选 repo 权限)
#   - Docker Desktop 运行中
#   - 当前在 Git 仓库中，已打 tag
#
# 用法：
#   .\scripts\release.ps1              # 使用最新 git tag
#   .\scripts\release.ps1 v1.2.0       # 指定版本号
# ============================================================

[CmdletBinding()]
param(
    [string]$Version = ""  # 可选：手动指定版本号
)

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent (Split-Path -Parent $PSCommandPath)

# ── 辅助函数 ─────────────────────────────────────────────

function Write-Step($msg) {
    Write-Host "`n============================================" -ForegroundColor Cyan
    Write-Host "  $msg" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
}

function Check-Command($cmd, $installHint) {
    $exists = Get-Command $cmd -ErrorAction SilentlyContinue
    if (-not $exists) {
        Write-Host "[ERROR] 找不到 $cmd，请先安装：$installHint" -ForegroundColor Red
        exit 1
    }
}

# ── Step 1: 获取版本号 ──────────────────────────────────

Write-Step "Step 1/6: 获取版本号"

if ($Version) {
    Write-Host "使用手动指定的版本号: $Version"
} else {
    try {
        $Version = git describe --tags --abbrev=0 2>$null
        if (-not $Version) {
            throw "No tags found"
        }
        Write-Host "从最新 git tag 获取版本号: $Version"
    } catch {
        Write-Host "[ERROR] 未找到 git tag！" -ForegroundColor Red
        Write-Host "请先打 tag：  git tag v1.0.0 && git push origin v1.0.0" -ForegroundColor Yellow
        exit 1
    }
}

# 去掉 v 前缀获取纯版本号
$VersionNumber = $Version -replace '^v', ''
$CommitHash = git rev-parse --short HEAD
$BuildTime = Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"

Write-Host "  版本号:    $Version"
Write-Host "  Commit:    $CommitHash"
Write-Host "  构建时间:  $BuildTime"

# ── Step 2: Docker 可复现构建 ────────────────────────────

Write-Step "Step 2/6: Docker 可复现构建 (编译 UI + Backend)"

Check-Command docker "Docker Desktop: https://www.docker.com/products/docker-desktop/"

Push-Location $ROOT

Write-Host "正在构建 Docker 镜像..."
docker compose build builder
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker 构建失败！" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "[OK] Docker 构建成功" -ForegroundColor Green

# ── Step 3: 从容器提取产物 ─────────────────────────────

Write-Step "Step 3/6: 提取编译产物"

Write-Host "清理旧的 dist 目录..."
if (Test-Path "$ROOT\proxy-backend\dist") {
    Remove-Item -Recurse -Force "$ROOT\proxy-backend\dist"
}

Write-Host "从 Docker 镜像提取 dist/ 产物..."
$containerId = docker create --name tmp-release easy-proxy-builder:latest
try {
    docker cp "tmp-release:/app/proxy-backend/dist" "$ROOT\proxy-backend\dist"
    if ($LASTEXITCODE -ne 0) {
        throw "docker cp 失败"
    }
    Write-Host "[OK] 产物已提取到 proxy-backend\dist\" -ForegroundColor Green
} finally {
    docker rm tmp-release | Out-Null
}

# ── Step 4: 同步版本号到 package.json ──────────────────

Write-Step "Step 4/6: 同步版本号到 package.json"

$pkgPath = "$ROOT\proxy-backend\package.json"
$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
$oldVersion = $pkg.version
$pkg.version = $VersionNumber  # 去掉 v 前缀的纯版本号
$pkg | ConvertTo-Json -Depth 10 | Set-Content -Path $pkgPath -Encoding UTF8
Write-Host "  package.json: $oldVersion → $VersionNumber"

# ── Step 5: electron-builder 打包 ───────────────────────

Write-Step "Step 5/6: electron-builder 打包 Windows .exe"

Push-Location "$ROOT\proxy-backend"

# 确保 electron-builder 可用
if (-not (Test-Path "node_modules\.bin\electron-builder.cmd")) {
    Write-Host "[WARN] electron-builder 未安装，正在安装依赖..." -ForegroundColor Yellow
    npm install
}

Write-Host "正在打包..."
npx electron-builder --win
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Pop-Location
    Write-Host "[ERROR] electron-builder 打包失败！" -ForegroundColor Red
    exit 1
}

Pop-Location  # 回到 $ROOT

Write-Host "[OK] 打包完成" -ForegroundColor Green

# 列出产物
Write-Host "产物列表:"
Get-ChildItem "$ROOT\proxy-backend\release" | ForEach-Object {
    $sizeMB = [math]::Round($_.Length / 1MB, 2)
    Write-Host "  $($_.Name)  ($sizeMB MB)"
}

# ── Step 6: 发布到 GitHub Releases ─────────────────────

Write-Step "Step 6/6: 发布到 GitHub Releases"

# 获取 release 目录下所有 .exe 文件
$exeFiles = Get-ChildItem "$ROOT\proxy-backend\release" -Filter "*.exe" | ForEach-Object { $_.FullName }

if (-not $exeFiles) {
    Write-Host "[ERROR] 未找到 .exe 产物！" -ForegroundColor Red
    exit 1
}

# 获取 GitHub 仓库信息
$remoteUrl = git config --get remote.origin.url
$remoteUrl = $remoteUrl -replace '\.git$', ''
# 从 git@github.com:owner/repo 或 https://github.com/owner/repo 提取 owner/repo
if ($remoteUrl -match 'github\.com[:/](.+)/(.+)$') {
    $RepoOwner = $Matches[1]
    $RepoName = $Matches[2]
} else {
    Write-Host "[ERROR] 无法解析 GitHub 仓库地址: $remoteUrl" -ForegroundColor Red
    exit 1
}
Write-Host "仓库: $RepoOwner/$RepoName"

# 判断使用哪种方式上传：优先 gh CLI，回退到 API Token
$useGh = $false
$Token = ""

$ghExists = Get-Command gh -ErrorAction SilentlyContinue
if ($ghExists) {
    gh auth status 2>$null
    if ($LASTEXITCODE -eq 0) {
        $useGh = $true
        Write-Host "使用 GitHub CLI (gh) 上传..."
    } else {
        Write-Host "[WARN] gh 已安装但未登录，尝试其他方式..." -ForegroundColor Yellow
    }
}

if (-not $useGh) {
    $Token = $env:PROXY_APP_GITHUB_TOKEN
    if (-not $Token) {
        Write-Host @"

[ERROR] 未找到 GitHub 认证方式！请二选一：

  方式 A (推荐): 安装 GitHub CLI
    winget install GitHub.cli
    gh auth login

  方式 B: 设置 Personal Access Token
    1. 打开 https://github.com/settings/tokens
    2. 点击 "Generate new token (classic)"
    3. 勾选 "repo" 权限，生成 token
    4. 运行: `$env:PROXY_APP_GITHUB_TOKEN="ghp_xxxxxxxx"`
    5. 重新执行本脚本

"@ -ForegroundColor Red
        exit 1
    }
    Write-Host "使用 GITHUB_TOKEN (API) 上传..."
}

# ── 发布 ──────────────────────────────────────────────

$releaseTitle = "Easy Proxy $Version"
$releaseNotes = @"
## 版本信息

- **版本号**: $Version
- **Commit**: $CommitHash
- **构建时间**: $BuildTime

## 安装

下载 `Easy-Proxy-Setup-$VersionNumber.exe` 双击安装即可。
"@

if ($useGh) {
    # ── 方式 A: gh CLI ──────────────────────────────
    $existingRelease = gh release view $Version --json tagName 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($existingRelease) {
        Write-Host "[WARN] GitHub Release $Version 已存在，上传制品..." -ForegroundColor Yellow
        foreach ($file in $exeFiles) {
            Write-Host "  上传: $(Split-Path -Leaf $file)"
            gh release upload $Version $file --clobber
        }
    } else {
        Write-Host "创建 Release 并上传制品..."
        $fileArgs = $exeFiles | ForEach-Object { "`"$_`"" }
        $fileArgsStr = [string]::Join(" ", $fileArgs)
        Invoke-Expression "gh release create $Version $fileArgsStr --title `"$releaseTitle`" --notes `"$releaseNotes`""
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] GitHub Release 创建失败！" -ForegroundColor Red
            exit 1
        }
    }
} else {
    # ── 方式 B: GitHub REST API ─────────────────────
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Accept"        = "application/vnd.github+json"
    }
    $apiBase = "https://api.github.com/repos/$RepoOwner/$RepoName"

    # 先检查 release 是否已存在
    try {
        $existingRelease = Invoke-RestMethod -Uri "$apiBase/releases/tags/$Version" -Headers $headers -Method Get
    } catch {
        $existingRelease = $null
    }
    if ($existingRelease) {
        Write-Host "[WARN] GitHub Release $Version 已存在，上传制品..." -ForegroundColor Yellow
        $releaseId = $existingRelease.id
        # 更新 Release body（修复可能的乱码）
        $updateBody = @{ body = $releaseNotes } | ConvertTo-Json -Compress
        $updateBodyBytes = [System.Text.Encoding]::UTF8.GetBytes($updateBody)
        try {
            Invoke-RestMethod -Uri "$apiBase/releases/$releaseId" -Headers $headers -Method Patch -Body $updateBodyBytes -ContentType "application/json; charset=utf-8"
            Write-Host "    Release body 已更新"
        } catch {
            Write-Host "    [WARN] 更新 body 失败: $_"
        }
    } else {
        Write-Host "创建 Release..."
        $body = @{
            tag_name = $Version
            name     = $releaseTitle
            body     = $releaseNotes
            draft    = $false
            prerelease = $false
        } | ConvertTo-Json -Compress

        # 显式 UTF-8 编码，避免中文乱码
        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
        $newRelease = Invoke-RestMethod -Uri "$apiBase/releases" -Headers $headers -Method Post -Body $bodyBytes -ContentType "application/json; charset=utf-8"
        $releaseId = $newRelease.id
        Write-Host "Release 创建成功 (id: $releaseId)"
    }

    # 上传每个 .exe 制品
    foreach ($file in $exeFiles) {
        $fileName = Split-Path -Leaf $file
        Write-Host "  上传: $fileName"
        $uploadUrl = "https://uploads.github.com/repos/$RepoOwner/$RepoName/releases/$releaseId/assets"
        $uploadHeaders = @{
            "Authorization" = "Bearer $Token"
            "Accept"        = "application/vnd.github+json"
            "Content-Type"  = "application/octet-stream"
        }
        # 文件名需要通过 query string 传递
        $uploadUrlWithName = "$uploadUrl`?name=$([uri]::EscapeDataString($fileName))"
        try {
            $uploadResult = Invoke-RestMethod -Uri $uploadUrlWithName -Headers $uploadHeaders -Method Post -InFile $file
            Write-Host "    [OK] 上传成功: $($uploadResult.name)" -ForegroundColor Green
        } catch {
            Write-Host "    [WARN] 上传 $fileName 失败: $_" -ForegroundColor Yellow
        }
    }
}

# ── 完成 ────────────────────────────────────────────────

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "  发布完成！" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  版本:    $Version"
Write-Host "  Release: https://github.com/$RepoOwner/$RepoName/releases/tag/$Version"
Write-Host "  下载:    https://github.com/$RepoOwner/$RepoName/releases/download/$Version/Easy-Proxy-Setup-$VersionNumber.exe"
Write-Host ""

Pop-Location  # 回到初始目录

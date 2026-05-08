$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$Frontend = Join-Path $Root "frontend"
$Backend = Join-Path $Root "backend"
$Launcher = Join-Path $Root "packaging\care_twin_launcher.py"
$Release = Join-Path $Root "release"

Write-Host "Building CareTwin Home frontend..." -ForegroundColor Cyan
Push-Location $Frontend
npm install
npm run build
Pop-Location

Write-Host "Installing PyInstaller if needed..." -ForegroundColor Cyan
python -m pip install --upgrade pyinstaller

if (Test-Path $Release) {
  Remove-Item -Recurse -Force $Release
}
New-Item -ItemType Directory -Force -Path $Release | Out-Null

Write-Host "Packaging Windows executable..." -ForegroundColor Cyan
Push-Location $Root
python -m PyInstaller `
  --noconfirm `
  --clean `
  --name CareTwinHome `
  --paths "$Backend" `
  --add-data "backend;backend" `
  --add-data "frontend\dist;frontend\dist" `
  "$Launcher"
Pop-Location

$DistExe = Join-Path $Root "dist\CareTwinHome\CareTwinHome.exe"
$TargetDir = Join-Path $Release "CareTwinHome-Demo"
New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
Copy-Item -Recurse -Force (Join-Path $Root "dist\CareTwinHome\*") $TargetDir

$Readme = @"
CareTwin Home / 慧伴居 内部演示版

使用方法：
1. 双击 CareTwinHome.exe
2. 稍等几秒，浏览器会自动打开本地演示网页
3. 如果浏览器没有自动打开，请看黑色窗口里的 http://127.0.0.1:端口 地址
4. 关闭黑色窗口即可结束演示服务

说明：
- 不需要安装 Node.js
- 不需要手动启动前端或后端
- 这是本机离线演示，不是公网分享链接
"@

Set-Content -Path (Join-Path $TargetDir "README-双击运行说明.txt") -Value $Readme -Encoding UTF8

Compress-Archive -Path $TargetDir -DestinationPath (Join-Path $Release "CareTwinHome-Demo.zip") -Force

Write-Host "Done." -ForegroundColor Green
Write-Host "Folder: $TargetDir"
Write-Host "Zip:    $(Join-Path $Release 'CareTwinHome-Demo.zip')"

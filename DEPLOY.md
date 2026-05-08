# CareTwin Home 分享部署指南

这个项目现在可以作为一个完整 Web App 部署：FastAPI 后端会同时提供 API、WebSocket 和打包后的 React 前端。

## 推荐方式：Render / Railway / 云服务器 Docker 部署

1. 把项目上传到 GitHub。
2. 在 Render、Railway 或支持 Docker 的云服务器中新建 Web Service。
3. 选择这个仓库，使用根目录下的 `Dockerfile`。
4. 部署完成后，平台会给你一个公网地址，例如：

```text
https://care-twin-home-demo.onrender.com
```

别人打开这个地址即可体验完整仿真。

## 本地验证生产版

先构建前端：

```powershell
cd frontend
npm install
npm run build
```

然后启动后端托管完整网站：

```powershell
cd ..\backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

打开：

```text
http://127.0.0.1:8000/
```

## 临时分享

如果只是临时给别人看，可以在本地启动生产版后，用 Cloudflare Tunnel、ngrok 或 Tailscale Funnel 暴露 `8000` 端口。

示例：

```powershell
cloudflared tunnel --url http://127.0.0.1:8000
```

生成的临时 `https://...trycloudflare.com` 地址可以直接分享。

## GitHub Pages 静态演示

GitHub Pages 不能运行 FastAPI 后端和 WebSocket 服务，所以本项目提供了一个静态演示模式。静态模式会在浏览器内模拟场景事件流，适合把网页直接部署到 GitHub Pages 进行团队预览。

部署步骤：

1. 在 GitHub 新建一个仓库，例如 `care-twin-home`。
2. 把本项目推送到该仓库的 `main` 分支。
3. 进入 GitHub 仓库页面：`Settings` -> `Pages`。
4. 在 `Build and deployment` 中选择 `GitHub Actions`。
5. 推送后，仓库内的 `.github/workflows/pages.yml` 会自动构建并发布静态演示。

构建命令等价于：

```powershell
cd frontend
$env:VITE_STATIC_DEMO="1"
npm run build
```

发布成功后，网页地址通常是：

```text
https://你的用户名.github.io/care-twin-home/
```

注意：GitHub Pages 版本是静态仿真展示，不连接真实 FastAPI 后端；如果要展示真实后端 WebSocket，则使用 Docker/云服务器部署。

## 注意

- MVP 不接真实硬件。
- MVP 不使用摄像头。
- 演示文案避免医疗诊断，只表达“风险模式”和“需要确认”。

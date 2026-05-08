# GitHub + GitHub Pages 部署步骤

这个仓库已经准备好 GitHub Pages 静态演示模式。

## 1. 创建 GitHub 仓库

在 GitHub 新建仓库，例如：

```text
care-twin-home
```

建议选择 Public，方便团队成员直接访问网页。

## 2. 本地初始化并推送

在项目根目录运行：

```powershell
git init
git add .
git commit -m "Initial CareTwin Home demo"
git branch -M main
git remote add origin https://github.com/你的用户名/care-twin-home.git
git push -u origin main
```

如果 GitHub 要求登录，请按提示完成网页登录或 token 登录。

## 3. 开启 GitHub Pages

进入 GitHub 仓库：

```text
Settings -> Pages
```

在 `Build and deployment` 里选择：

```text
Source: GitHub Actions
```

然后等待 Actions 自动完成。

## 4. 分享网页

部署完成后，GitHub 会给出类似地址：

```text
https://你的用户名.github.io/care-twin-home/
```

把这个链接发给队友即可。

## 说明

- GitHub Pages 版本使用静态仿真模式，所有场景在浏览器内模拟。
- 如果要完整后端 WebSocket 版本，请使用 Docker/服务器部署。

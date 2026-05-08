# Windows exe 内部演示打包

在 Windows PowerShell 中运行：

```powershell
.\packaging\build_windows_exe.ps1
```

输出文件：

```text
release/CareTwinHome-Demo/
release/CareTwinHome-Demo.zip
```

队友解压后双击 `CareTwinHome.exe` 即可打开本地仿真网页。

注意：

- 这是本机离线演示版，不是公网链接。
- 首次启动可能会被 Windows Defender 或 SmartScreen 提醒，选择“仍要运行”即可。
- exe 会启动一个本地 `127.0.0.1` 服务，并自动打开浏览器。

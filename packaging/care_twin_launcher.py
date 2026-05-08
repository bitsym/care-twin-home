import os
import socket
import sys
import threading
import time
import urllib.request
import webbrowser
from pathlib import Path

import uvicorn


APP_NAME = "CareTwin Home / 慧伴居"


def app_root() -> Path:
    if getattr(sys, "frozen", False):
        return Path(sys._MEIPASS)  # type: ignore[attr-defined]
    return Path(__file__).resolve().parents[1]


def choose_port() -> int:
    configured_port = os.environ.get("CARETWIN_PORT")
    if configured_port:
        return int(configured_port)

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def wait_until_ready(url: str, timeout_seconds: int = 20) -> bool:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=1) as response:
                return response.status == 200
        except OSError:
            time.sleep(0.25)
    return False


def main() -> int:
    root = app_root()
    backend_dir = root / "backend"
    frontend_dist = root / "frontend" / "dist"

    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))

    os.environ["CARETWIN_FRONTEND_DIST"] = str(frontend_dist)

    from main import app

    port = choose_port()
    base_url = f"http://127.0.0.1:{port}"
    config = uvicorn.Config(
        app,
        host="127.0.0.1",
        port=port,
        log_level="warning",
        access_log=False,
    )
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    if wait_until_ready(f"{base_url}/health"):
        if os.environ.get("CARETWIN_NO_BROWSER") != "1":
            webbrowser.open(base_url)
        print(f"{APP_NAME} 已启动：{base_url}")
        print("关闭这个窗口即可结束本地演示服务。")
        try:
            while thread.is_alive():
                time.sleep(0.5)
        except KeyboardInterrupt:
            server.should_exit = True
        return 0

    print("启动失败：本地演示服务没有在预期时间内响应。")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())

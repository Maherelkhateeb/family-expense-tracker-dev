import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import http.server
import socketserver
import threading
import time
import os
from playwright.sync_api import sync_playwright

PORT = 8991
DIRECTORY = "C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    def log_message(self, format, *args):
        pass

httpd = socketserver.TCPServer(("", PORT), Handler)
server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
server_thread.start()
print(f"HTTP server started at http://localhost:{PORT}")

errors = []
logs = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.on("console", lambda msg: logs.append(f"[{msg.type}] {msg.text}"))
    page.on("pageerror", lambda err: errors.append(str(err)))

    try:
        page.goto(f"http://localhost:{PORT}/index.html", timeout=15000)
        page.wait_for_timeout(2000)
        print("Page title:", page.title())
        print(f"Total console logs: {len(logs)}")
        print(f"Total page errors: {len(errors)}")
        for err in errors:
            print("ERROR:", err)
        for log in logs:
            if "error" in log.lower() or "warn" in log.lower() or "uncaught" in log.lower():
                print("CONSOLE:", log)
    except Exception as e:
        print("Playwright Exception:", e)
    finally:
        browser.close()

httpd.shutdown()

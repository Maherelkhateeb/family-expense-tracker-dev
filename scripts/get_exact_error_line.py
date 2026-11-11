import os, sys, time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

html_path = os.path.abspath("index.html")
file_url = f"file:///{html_path.replace(os.sep, '/')}"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    def handle_error(err):
        print(f"PAGE ERROR: {err}")
        # print all properties of err
        for attr in dir(err):
            if not attr.startswith('_'):
                try:
                    val = getattr(err, attr)
                    print(f"  {attr}: {val}")
                except:
                    pass

    page.on("pageerror", handle_error)
    page.goto(file_url, wait_until="networkidle")
    time.sleep(1)
    browser.close()

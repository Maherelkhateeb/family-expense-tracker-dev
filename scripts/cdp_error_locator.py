import os, sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

html_path = os.path.abspath("index.html")
file_url = f"file:///{html_path.replace(os.sep, '/')}"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    client = page.context.new_cdp_session(page)
    client.send("Runtime.enable")

    def on_exception(event):
        details = event.get('exceptionDetails', {})
        print("CDP EXCEPTION:")
        print("  text:", details.get('text'))
        print("  lineNumber:", details.get('lineNumber'))
        print("  columnNumber:", details.get('columnNumber'))
        print("  url:", details.get('url'))
        print("  exception:", details.get('exception', {}).get('description'))

    client.on("Runtime.exceptionThrown", on_exception)

    page.goto(file_url, wait_until="networkidle")
    browser.close()

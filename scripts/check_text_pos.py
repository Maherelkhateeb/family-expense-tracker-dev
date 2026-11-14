import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:8991/scripts/test_visual_pos.png") # wait, we can just inspect elements
    # Let's inspect the text positions of Text 1, 2, 3, 4, 5 in html_content
    browser.close()

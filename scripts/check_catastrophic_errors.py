# -*- coding: utf-8 -*-
import re

FILE = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(FILE, 'r', encoding='utf-8') as f:
    text = f.read()

print(f"File size: {len(text):,} bytes")

# 1. Check all <script> tags
script_matches = list(re.finditer(r'<script\b([^>]*)>([\s\S]*?)</script>', text, re.IGNORECASE))
print(f"Total <script> blocks found: {len(script_matches)}")

# 2. Extract each script and test syntax using CDP/Playwright
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    cdp = page.context.new_cdp_session(page)
    cdp.send('Runtime.enable')

    exceptions = []
    def on_exc(e):
        details = e.get('exceptionDetails', {})
        exceptions.append(details)
        print("CDP EXCEPTION:", details.get('text'), "at line", details.get('lineNumber'), "desc:", details.get('exception', {}).get('description'))

    cdp.on('Runtime.exceptionThrown', on_exc)
    page.goto(r'file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html')
    page.wait_for_timeout(1500)
    browser.close()

print(f"\nTotal browser exceptions on load: {len(exceptions)}")

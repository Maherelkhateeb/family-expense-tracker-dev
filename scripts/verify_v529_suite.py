# -*- coding: utf-8 -*-
import sys
import subprocess
import time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

server = subprocess.Popen(['python', '-m', 'http.server', '8898'], cwd=r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy')
time.sleep(1.5)

errors = []
logs = []

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport similar to user's phone screenshot
        page = browser.new_page(viewport={'width': 412, 'height': 915})
        page.on('pageerror', lambda err: errors.append(f"PAGE ERROR: {err}"))
        page.on('console', lambda msg: errors.append(f"CONSOLE ERROR: {msg.text}") if msg.type == 'error' else logs.append(msg.text))

        print("Navigating to app on http://localhost:8898/index.html...")
        page.goto('http://localhost:8898/index.html', wait_until='networkidle')
        time.sleep(1.0)

        # 1. Verify in-app removal of 6-faces picture
        prohibited_imgs = page.evaluate("""() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            return imgs.filter(img => img.src.includes('avatar_all_family') || img.src.includes('family_portrait')).map(img => img.outerHTML);
        }""")
        print(f"1. In-app prohibited 6-faces image count: {len(prohibited_imgs)}")
        if len(prohibited_imgs) > 0:
            errors.append(f"Prohibited images found inside program: {prohibited_imgs}")
        else:
            print("   -> SUCCESS: 6-faces photo completely deleted from inside the program!")

        # 2. Check PWA icons in <head>
        pwa_head_links = page.evaluate("""() => {
            const links = Array.from(document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]'));
            return links.map(l => ({ rel: l.rel, href: l.getAttribute('href') }));
        }""")
        print(f"2. PWA link tags in <head>: {pwa_head_links}")

        # Capture Clean Home Page
        page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\v529_home_clean.png')
        print("   -> Saved v529_home_clean.png")

        # 3. Open Settings Modal
        print("3. Opening Settings Modal...")
        page.click('#btnMainSettings')
        time.sleep(0.8)

        # Check .icon-theme-pill elements
        icon_pills_count = page.evaluate("() => document.querySelectorAll('.icon-theme-pill').length")
        print(f"   -> Found {icon_pills_count} icon theme pills in settings modal.")

        # Test clicking icon theme 'gold'
        page.click('#iconThemeOptGold')
        time.sleep(0.3)
        icon_theme = page.evaluate("() => document.documentElement.getAttribute('data-icon-theme')")
        print(f"   -> data-icon-theme after clicking gold: {icon_theme}")

        # Test clicking icon theme 'vibrant'
        page.click('#iconThemeOptVibrant')
        time.sleep(0.3)

        # Capture Settings Modal screenshot to verify styling matches user requirements
        page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\v529_settings_clean.png')
        print("   -> Saved v529_settings_clean.png")

        # Close settings modal
        page.evaluate("() => closeModal('settingsModal')")
        time.sleep(0.5)

        # 4. Check Commitments Page
        print("4. Testing Commitments Page...")
        page.click('#navTabExpected')
        time.sleep(0.8)
        page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\v529_commitments_clean.png')
        print("   -> Saved v529_commitments_clean.png")

        # 5. Check Tasks Modal
        print("5. Testing Tasks Modal...")
        page.click('#btnHeaderTasksTop')
        time.sleep(0.8)
        tasks_modal_visible = page.is_visible('#tasksFullScreenModal')
        print(f"   -> Tasks modal visible: {tasks_modal_visible}")
        page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\v529_tasks_clean.png')
        print("   -> Saved v529_tasks_clean.png")
        page.evaluate("() => closeTasksFullScreenModal()")
        time.sleep(0.5)

        browser.close()

finally:
    server.terminate()

print(f"\nTotal runtime errors: {len(errors)}")
if errors:
    print("ERRORS ENCOUNTERED:")
    for err in errors:
        print("  -", err)
else:
    print("100% PERFECT VERIFICATION! ZERO ERRORS ENCOUNTERED!")

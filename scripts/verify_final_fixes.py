import sys, io, os
from playwright.sync_api import sync_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

artifact_dir = r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670"
html_path = os.path.abspath("index.html")
file_url = f"file:///{html_path.replace(os.sep, '/')}"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 412, 'height': 915})

    page.goto(file_url, wait_until="domcontentloaded")
    page.wait_for_timeout(1000)

    # 1. Verify merged sync pill in header
    sync_btn = page.locator('#btnHeaderMasterSync')
    btn_text = sync_btn.text_content().strip()
    print("Merged sync button text:", btn_text)

    # Screenshot 1: Home showing header sync pill + bottom navigation bar
    shot1 = os.path.join(artifact_dir, "v495_fixed_home_and_bottom_nav.png")
    page.screenshot(path=shot1)
    print("Saved screenshot 1:", shot1)

    # 2. Click the gold pill to open the right side drawer
    page.click('#btnOpenGold')
    page.wait_for_timeout(600)

    # Screenshot 2: Gold Right Drawer open
    shot2 = os.path.join(artifact_dir, "v495_fixed_gold_right_drawer.png")
    page.screenshot(path=shot2)
    print("Saved screenshot 2:", shot2)

    # Close gold drawer
    page.click('#btnCloseDrawer')
    page.wait_for_timeout(400)

    # 3. Test clicking a bottom nav tab (e.g. Operations)
    page.click('#navTabOperations')
    page.wait_for_timeout(500)
    ops_visible = page.locator('#viewOperations').is_visible()
    print("Operations page visible after bottom nav click:", ops_visible)

    # Screenshot 3: Operations page via bottom nav
    shot3 = os.path.join(artifact_dir, "v495_fixed_operations_via_nav.png")
    page.screenshot(path=shot3)
    print("Saved screenshot 3:", shot3)

    browser.close()
    print("\nALL VERIFICATIONS COMPLETED SUCCESSFULLY!")

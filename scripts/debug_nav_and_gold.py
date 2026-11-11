import sys, io, os
from playwright.sync_api import sync_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

html_path = os.path.abspath("index.html")
file_url = f"file:///{html_path.replace(os.sep, '/')}"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 412, 'height': 915})

    page.goto(file_url, wait_until="domcontentloaded")
    page.wait_for_timeout(1000)

    # 1. Check Bottom Nav
    nav = page.locator('#appBottomNav')
    nav_visible = nav.is_visible()
    nav_box = nav.bounding_box()
    nav_cs = page.evaluate("""() => {
        const el = document.getElementById('appBottomNav');
        if (!el) return null;
        const cs = window.getComputedStyle(el);
        return {
            display: cs.display,
            visibility: cs.visibility,
            opacity: cs.opacity,
            position: cs.position,
            bottom: cs.bottom,
            left: cs.left,
            zIndex: cs.zIndex,
            height: cs.height,
            width: cs.width,
            transform: cs.transform
        };
    }""")
    print("Nav is_visible:", nav_visible)
    print("Nav bounding box:", nav_box)
    print("Nav computed style:", nav_cs)

    # 2. Check Gold Drawer
    page.click('#btnOpenGold')
    page.wait_for_timeout(500)
    gold_panel = page.locator('#goldDrawerPanel')
    gold_visible = gold_panel.is_visible()
    gold_box = gold_panel.bounding_box()
    gold_cs = page.evaluate("""() => {
        const el = document.getElementById('goldDrawerPanel');
        if (!el) return null;
        const cs = window.getComputedStyle(el);
        return {
            display: cs.display,
            visibility: cs.visibility,
            opacity: cs.opacity,
            position: cs.position,
            top: cs.top,
            right: cs.right,
            zIndex: cs.zIndex,
            transform: cs.transform
        };
    }""")
    print("Gold panel is_visible after click:", gold_visible)
    print("Gold panel bounding box:", gold_box)
    print("Gold panel computed style:", gold_cs)

    browser.close()

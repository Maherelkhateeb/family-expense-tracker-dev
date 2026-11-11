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

    # Inspect all ancestors of #appBottomNav
    ancestors_info = page.evaluate("""() => {
        let el = document.getElementById('appBottomNav');
        const list = [];
        while (el && el !== document.body) {
            el = el.parentElement;
            if (!el) break;
            const cs = window.getComputedStyle(el);
            list.push({
                tag: el.tagName,
                id: el.id,
                className: el.className,
                display: cs.display,
                visibility: cs.visibility,
                style_display: el.style.display
            });
        }
        return list;
    }""")
    print("Ancestors of #appBottomNav:")
    for a in ancestors_info:
        print(f"  {a['tag']}#{a['id']}.{a['className']} => computed display: {a['display']} (style: {a['style_display']})")

    # Inspect all ancestors of #goldDrawerPanel
    gold_ancestors = page.evaluate("""() => {
        let el = document.getElementById('goldDrawerPanel');
        const list = [];
        while (el && el !== document.body) {
            el = el.parentElement;
            if (!el) break;
            const cs = window.getComputedStyle(el);
            list.push({
                tag: el.tagName,
                id: el.id,
                className: el.className,
                display: cs.display,
                visibility: cs.visibility,
                style_display: el.style.display
            });
        }
        return list;
    }""")
    print("\nAncestors of #goldDrawerPanel:")
    for a in gold_ancestors:
        print(f"  {a['tag']}#{a['id']}.{a['className']} => computed display: {a['display']} (style: {a['style_display']})")

    browser.close()

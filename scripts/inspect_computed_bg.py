from playwright.sync_api import sync_playwright

def inspect_theme(theme_name):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 420, 'height': 880})
        page.goto('file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html?user=maher')
        page.wait_for_timeout(2000)
        
        page.evaluate(f"setAppTheme('{theme_name}', true);")
        page.wait_for_timeout(1000)
        
        elements = [
            'html', 'body', '#appFrame', '.mobile-frame',
            '.page-view.active', '.app-scroll-body', '#catGrid',
            '.cat-card', '.cat-card-upper', '.cat-card-lower',
            '.app-header', '.app-bottom-nav', '.kpi-master-wealth-cockpit'
        ]
        print(f"=== THEME: {theme_name} ===")
        for sel in elements:
            res = page.evaluate(f'''() => {{
                const el = document.querySelector("{sel}");
                if (!el) return 'NOT FOUND';
                const s = window.getComputedStyle(el);
                return {{
                    bg: s.backgroundColor,
                    bgImg: s.backgroundImage.substring(0, 40),
                    opacity: s.opacity
                }};
            }}''')
            print(f"{sel:28}: {res}")
        browser.close()

if __name__ == '__main__':
    for t in ['emerald', 'purple', 'light', 'midnight', 'gold']:
        inspect_theme(t)

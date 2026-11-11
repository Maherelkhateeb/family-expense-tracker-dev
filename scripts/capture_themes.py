from playwright.sync_api import sync_playwright

def capture_more():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 420, 'height': 880})
        page.goto('file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html?user=maher')
        page.wait_for_timeout(2000)
        
        test_pairs = [
            ('purple', 'cyber'),
            ('rose', 'ruby'),
            ('ocean', 'teal'),
            ('gold', 'gold'),
            ('crimson', 'amber')
        ]
        for t, ic in test_pairs:
            page.evaluate(f"setAppTheme('{t}', true); setAppIconTheme('{ic}', true);")
            page.wait_for_timeout(600)
            page.screenshot(path=rf"C:\Users\96656\.gemini\antigravity\brain\1661ab9d-1423-4a78-8610-5105477fd91a\verified_{t}_{ic}.png")
            print(f"Captured {t}_{ic}")
        browser.close()

if __name__ == '__main__':
    capture_more()

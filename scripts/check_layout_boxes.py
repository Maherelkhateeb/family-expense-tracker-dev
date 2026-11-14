import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 412, 'height': 892})
    file_path = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
    page.goto(f'file:///{file_path}', wait_until='domcontentloaded')
    page.wait_for_timeout(1000)
    
    info = page.evaluate('''() => {
      const getB = id => {
        const el = document.getElementById(id) || document.querySelector(id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return {
          id: id,
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          height: style.height,
          width: style.width,
          rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height }
        };
      };
      return {
        frame: getB('.mobile-frame'),
        header: getB('.app-header'),
        scrollBody: getB('.app-scroll-body'),
        viewExpenses: getB('#viewExpenses'),
        cockpit: getB('.kpi-master-wealth-cockpit'),
        catGrid: getB('#catGrid'),
        bottomNav: getB('.app-bottom-nav')
      };
    }''')
    for k, v in info.items():
        print(f'{k}: {v}')
        
    shot_path = r'C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\v497_diagnose_viewport.png'
    page.screenshot(path=shot_path, full_page=True)
    print('Screenshot saved to:', shot_path)
    browser.close()

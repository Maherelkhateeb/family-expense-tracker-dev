import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with open(r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the stray CSS after line 11621
old_block = '''</style>

    /* =========================================================================
       قواعد التباين العالي المحاسبي لكافة التسجيلات والكتابات (High Contrast Rules)'''

new_block = '''    /* =========================================================================
       قواعد التباين العالي المحاسبي لكافة التسجيلات والكتابات (High Contrast Rules)'''

assert old_block in content, "old_block not found!"
content_fixed = content.replace(old_block, new_block, 1)

old_head = '</head>\n<body>'
new_head = '''    /* إخفاء القوائم الجانبية المغلقة لتفادي أي تمدد أفقي في المتصفح */
    .side-drawer-panel:not(.open) { display: none !important; }
    .summary-left-drawer:not(.open) { display: none !important; }
    .side-drawer-panel.open, .summary-left-drawer.open { display: flex !important; }
  </style>
</head>
<body>'''

assert old_head in content_fixed, "old_head not found!"
content_fixed = content_fixed.replace(old_head, new_head, 1)

with open(r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\test_fixed_layout.html', 'w', encoding='utf-8') as f:
    f.write(content_fixed)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 412, 'height': 892})
    file_path = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/test_fixed_layout.html'
    page.goto(f'file:///{file_path}', wait_until='domcontentloaded')
    page.wait_for_timeout(1000)
    
    info = page.evaluate('''() => {
      const b = document.body;
      const af = document.getElementById('appFrame');
      const r = af ? af.getBoundingClientRect() : null;
      return {
        bodyScrollWidth: b.scrollWidth,
        appFrameRect: r,
        goldDrawerDisplay: window.getComputedStyle(document.getElementById('goldDrawerPanel')).display,
        leftDrawerDisplay: window.getComputedStyle(document.getElementById('summaryLeftDrawer')).display
      };
    }''')
    print('TEST RESULT:', info)
    page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\test_fixed_layout.png')
    browser.close()

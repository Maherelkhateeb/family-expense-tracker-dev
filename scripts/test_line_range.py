import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/bad_script_5.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    for line_idx in range(3550, 3630):
        chunk = "".join(lines[:line_idx])
        # We can close with '}' or test if it parses with ')' or '}'
        # Just check what error it gives
        err = page.evaluate("""c => {
            try {
                new Function(c);
                return 'OK';
            } catch(e) {
                return e.message;
            }
        }""", chunk)
        if 'Unexpected' in err:
            print(f"Line {line_idx} produced error: {err}")
            # print line
            print(f"  --> {lines[line_idx-1].strip()}")
            break

    browser.close()

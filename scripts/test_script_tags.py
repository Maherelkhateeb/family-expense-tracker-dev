import os, sys, re
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# find all script tags
pattern = r'<script\b[^>]*>([\s\S]*?)</script>'
scripts = [(m.start(), m.group(0), m.group(1)) for m in re.finditer(pattern, html)]
print(f"Total script tags: {len(scripts)}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    for idx, (start_pos, full_tag, code) in enumerate(scripts):
        if not code.strip():
            continue
        try:
            # Test compiling code in browser JS engine
            page.evaluate(f"""code => {{
                try {{
                    new Function(code);
                    return 'OK';
                }} catch(e) {{
                    return e.name + ': ' + e.message + '\\n' + (e.stack || '');
                }}
            }}""", code)
            result = page.evaluate("c => { try { new Function(c); return 'OK'; } catch(e) { return e.toString(); } }", code)
            if result != 'OK':
                print(f"❌ Script tag #{idx} (starts at pos {start_pos}) has error:")
                print(result)
                # Let's save this code to a file so we can inspect it
                with open(f'scripts/bad_script_{idx}.js', 'w', encoding='utf-8') as out:
                    out.write(code)
                print(f"Saved bad script to scripts/bad_script_{idx}.js")
            else:
                print(f"✓ Script tag #{idx} (pos {start_pos}, length {len(code)}) compiled OK")
        except Exception as ex:
            print(f"Error testing script #{idx}: {ex}")

    browser.close()

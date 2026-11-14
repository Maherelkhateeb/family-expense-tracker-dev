import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/bad_script_5.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"bad_script_5.js has {len(lines)} lines")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Binary search for the prefix of lines that causes the error
    low = 1
    high = len(lines)
    first_bad_line = high

    while low <= high:
        mid = (low + high) // 2
        chunk = "".join(lines[:mid])
        # We need to close any open braces/functions to test syntax
        res = page.evaluate("""c => {
            try {
                new Function(c);
                return 'OK';
            } catch(e) {
                return e.message;
            }
        }""", chunk)
        
        # If the error is 'Unexpected token 'function'' or 'Unexpected token '}', that means a syntax error occurred up to mid
        if 'Unexpected' in res:
            first_bad_line = mid
            high = mid - 1
        else:
            low = mid + 1

    print(f"Error begins around line {first_bad_line}")
    start_show = max(0, first_bad_line - 15)
    end_show = min(len(lines), first_bad_line + 15)
    for i in range(start_show, end_show):
        print(f"{i+1}: {lines[i]}", end='')

    browser.close()

import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import json, re

VERSION = "v5.0.6"
BUILD = "202611081120"

# 1. version.json
vdata = {
    "version": VERSION,
    "build": BUILD,
    "releaseDate": "2026-11-08",
    "notes": "Preamble-free ultra-clean UI, global currency left alignment, mobile-first tasks workspace, member financial summary drawer with drill-down"
}
with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(vdata, f, indent=2, ensure_ascii=False)
print(f"[OK] version.json updated to {VERSION}")

# 2. sw.js
with open('sw.js', 'r', encoding='utf-8') as f:
    sw = f.read()
sw = re.sub(r"const CACHE_NAME = 'family-expense-[^']+';", f"const CACHE_NAME = 'family-expense-{VERSION}';", sw)
with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(sw)
print(f"[OK] sw.js updated to family-expense-{VERSION}")

# 3. index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
html = re.sub(r'<span class="version-badge">v[^<]+</span>', f'<span class="version-badge">{VERSION}</span>', html)
html = re.sub(r'v\d+\.\d+\.\d+ • متزامن', f'{VERSION} • متزامن', html)
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print(f"[OK] index.html version badges bumped to {VERSION}")

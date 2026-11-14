import sys, io, json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 1. Update version.json
ver_data = {
    "version": "4.9.5",
    "build": 202611071445,
    "updated_at": "2026-11-07 02:45 PM",
    "description": "Comprehensive UI/UX overhaul: Prominent balance & cash flow, category card framing, receipt camera in edit modal, audit ledger column header filters, left drawer summary with gold 21 and tasks integration, Banque Misr rates & responsiveness optimization"
}

with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(ver_data, f, indent=2, ensure_ascii=False)
print("✓ version.json updated to v4.9.5")

# 2. Update sw.js cache name
with open('sw.js', 'r', encoding='utf-8') as f:
    sw = f.read()

import re
sw = re.sub(r'family-monefy-v[\d\.]+', 'family-monefy-v4.9.5', sw)
sw = re.sub(r'const CACHE_NAME\s*=\s*[\'"][^\'"]+[\'"]', "const CACHE_NAME = 'family-monefy-v4.9.5'", sw)

with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(sw)
print("✓ sw.js updated to cache family-monefy-v4.9.5")

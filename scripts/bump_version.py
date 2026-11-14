import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import json
import re

VERSION_PATH = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/version.json'
SW_PATH = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/sw.js'
INDEX_PATH = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'

# Update version.json
v_data = {
    "version": "5.0.5",
    "build": "202611081100",
    "updatedAt": "2026-11-08T11:00:00+03:00",
    "releaseNotes": "Re-engineered modern Tasks Pro workspace inspired by Todoist & TickTick & MS To Do & Things 3, member-specific Left Drawer financial breakdown with 1-tap filtered drill-down, removed all noise & preambles in Settings, and enforced global currency to the left."
}
with open(VERSION_PATH, 'w', encoding='utf-8') as f:
    json.dump(v_data, f, ensure_ascii=False, indent=2)
print("[OK] version.json updated to v5.0.5")

# Update sw.js cache name
with open(SW_PATH, 'r', encoding='utf-8') as f:
    sw_content = f.read()
sw_content = re.sub(r"const CACHE_NAME = 'family-expense-v[^']+';", "const CACHE_NAME = 'family-expense-v5.0.5';", sw_content)
with open(SW_PATH, 'w', encoding='utf-8') as f:
    f.write(sw_content)
print("[OK] sw.js updated to family-expense-v5.0.5")

# Update index.html version tag if needed
with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    idx_content = f.read()
idx_content = re.sub(r'v5\.0\.\d+', 'v5.0.5', idx_content)
with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(idx_content)
print("[OK] index.html version badges bumped to v5.0.5")

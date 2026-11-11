import json

# Update version.json
v_data = {
    "version": "v5.2.1",
    "updatedAt": "2026-11-08T13:53:00+03:00",
    "changelog": [
        "v5.2.1: Rebuilt Commitments & Debts & Bills from scratch with clear separation between Debts and Bills",
        "v5.2.1: Modern coordinated Add screen for Bills and Debts with camera/photo attachments",
        "v5.2.1: Moved Tasks button to top header replacing family brand text",
        "v5.2.1: Re-engineered touch-friendly Task Date & Time Picker Modal with quick presets",
        "v5.2.1: Unified Master Sync & Balance button in top header merging offline balancing, live gold, and app update checks",
        "v5.2.1: Comprehensive Luxury FinTech theme redesign across all 9 palettes and subtle card styles",
        "v5.2.1: Fixed Operations filtering synchronization and Summary Drawer category/member drilldown",
        "v5.2.1: Hierarchical Back Navigation preserving filter state and sub-pages"
    ]
}

with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(v_data, f, ensure_ascii=False, indent=2)

print("Updated version.json")

# Update sw.js
with open('sw.js', 'r', encoding='utf-8') as f:
    sw = f.read()

import re
sw = re.sub(r"const CACHE_NAME = '[^']+';", "const CACHE_NAME = 'family-expense-tracker-v5.2.1';", sw)

with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(sw)

print("Updated sw.js to v5.2.1")

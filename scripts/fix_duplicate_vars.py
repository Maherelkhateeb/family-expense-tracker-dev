import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove the first standalone let currentSummaryPeriod = 'day';
target_dup = '''    // =========================================================================
    // 1. درج ملخص النشاط المالي الشامل (Summary Drawer Engine)
    // =========================================================================
    let currentSummaryPeriod = 'day';'''

replacement_dup = '''    // =========================================================================
    // 1. درج ملخص النشاط المالي الشامل (Summary Drawer Engine)
    // ========================================================================='''

if target_dup in html:
    html = html.replace(target_dup, replacement_dup, 1)
    print("✓ Removed first duplicate currentSummaryPeriod declaration")

# 2. Check the legacy duplicate functions at openSummaryDrawer_Legacy
legacy_pattern = r'''function openSummaryDrawer_Legacy\(\) \{[\s\S]*?function renderSummaryDrawer\(period = 'day'\) \{[\s\S]*?\}\s*\}\s*'''
# Let's inspect what's around openSummaryDrawer_Legacy
idx_leg = html.find("function openSummaryDrawer_Legacy")
if idx_leg != -1:
    print("Found openSummaryDrawer_Legacy at:", idx_leg)
    # Find the end of this duplicate block up to the start of next section
    # Let's see the snippet from idx_leg
    snippet = html[idx_leg:idx_leg+3000]
    # In Phase 2, we had added the unified drawer before, and this old block was renamed _Legacy
    # Let's remove the legacy block cleanly
    end_marker = "// ========================================================================="
    end_idx = html.find(end_marker, idx_leg)
    if end_idx != -1:
        print(f"Removing legacy block from {idx_leg} to {end_idx}")
        html = html[:idx_leg] + html[end_idx:]
        print("✓ Removed legacy duplicate functions")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Saved updated index.html")

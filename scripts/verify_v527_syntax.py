import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Check for our key elements and functions
elements = [
    'tasksUnifiedCreatorCard',
    'quickTaskTitleInput',
    'unifiedTaskTagChipsList',
    'btn-unified-tag-chip',
    'inlineTaskDueDate',
    'inlineTaskDueTime',
    'inlineDatePresetGroup',
    'inlineTimePresetGroup',
    'inlineTaskMemberGroup',
    'btnSubmitUnifiedTask',
    'selectTaskInlineTag',
    'selectInlineDatePreset',
    'selectInlineTimePreset',
    'selectInlineTaskMember',
    'openOrToggleUnifiedTaskCreator',
    'renderTaskTagBadge'
]

missing = []
for el in elements:
    if el not in text:
        missing.append(el)

if missing:
    print(f"❌ Missing elements: {missing}")
else:
    print("✅ All required UI elements and JS functions are present in index.html!")

# Extract script blocks and test basic syntax
script_matches = re.findall(r'<script(?:\s+type="[^"]*")?>([\s\S]*?)</script>', text)
print(f"Found {len(script_matches)} script tags.")

for idx, s in enumerate(script_matches):
    # Check for basic bracket balance
    opens = s.count('{')
    closes = s.count('}')
    if opens != closes:
        print(f"⚠️ Warning: Script #{idx+1} has mismatched braces: opens={opens}, closes={closes}")
print("Syntax check completed.")

# scripts/verify_v528_elements.py
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

checks = [
    'btnHeaderAddTaskTop',
    'btnProductivityAddTask',
    'btnTasksHeaderAdd',
    'tasksUnifiedCreatorCard',
    'triggerMainTaskCamera',
    'triggerMainTaskGallery',
    'triggerSubtaskCamera',
    'triggerSubtaskGallery',
    'openTasksAndAddNewTask',
    'showUnifiedTaskCreator',
    'hideUnifiedTaskCreator',
    'toggleUnifiedTaskCreator',
    'mainTaskCameraInput',
    'mainTaskGalleryInput',
    'subtaskCameraInput',
    'subtaskGalleryInput'
]

missing = [c for c in checks if c not in text]
if missing:
    print("❌ Missing elements/functions:", missing)
else:
    print("✅ All required v5.2.8 elements and functions are present in index.html!")

# Verify script syntax
script_matches = re.findall(r'<script(?:\s+type="[^"]*")?>([\s\S]*?)</script>', text)
print(f"Total script tags: {len(script_matches)}")
for idx, s in enumerate(script_matches):
    opens = s.count('{')
    closes = s.count('}')
    if opens != closes:
        print(f"⚠️ Warning: Script #{idx+1} mismatched braces: opens={opens}, closes={closes}")
print("Brace verification completed.")

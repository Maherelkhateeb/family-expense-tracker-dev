import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import os
import glob
import time

now = time.time()
paths_to_check = [
    'C:/Users/96656/Downloads',
    'C:/Users/96656/Pictures',
    'C:/Users/96656/Desktop',
    'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy',
    'C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670'
]

print("Checking recent files (< 24 hours):")
for base in paths_to_check:
    if not os.path.exists(base):
        continue
    for root, dirs, files in os.walk(base):
        # Skip .git and node_modules
        if '.git' in root or 'node_modules' in root:
            continue
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in ['.jpg', '.jpeg', '.png', '.webp']:
                full = os.path.join(root, f)
                try:
                    mtime = os.path.getmtime(full)
                    if now - mtime < 24 * 3600: # past 24 hours
                        print(f"[{time.ctime(mtime)}] {full} ({os.path.getsize(full)} bytes)")
                except Exception:
                    pass

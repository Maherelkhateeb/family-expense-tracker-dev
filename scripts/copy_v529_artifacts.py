import shutil
import os

artifact_dir = r'C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670'
src_dir = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy'

files = [
    'v529_home_clean.png',
    'v529_settings_clean.png',
    'v529_commitments_clean.png',
    'v529_tasks_clean.png'
]

for f in files:
    src = os.path.join(src_dir, f)
    dst = os.path.join(artifact_dir, f)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"Copied {f} to artifacts directory.")

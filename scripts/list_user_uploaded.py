import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import os
import glob

folder = 'C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670/.user_uploaded'
files = glob.glob(os.path.join(folder, '*'))
files.sort(key=os.path.getmtime, reverse=True)

print(f"Total files in .user_uploaded: {len(files)}")
for f in files[:10]:
    print(f"{os.path.basename(f)} - modified: {os.path.getmtime(f)} - size: {os.path.getsize(f)} bytes")

import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import glob
import os

folder = 'C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670/.user_uploaded'
for f in sorted(glob.glob(folder + '/*'), key=os.path.getmtime, reverse=True):
    print(f"{os.path.basename(f)} - {os.path.getsize(f)} bytes - mtime: {os.path.getmtime(f)}")

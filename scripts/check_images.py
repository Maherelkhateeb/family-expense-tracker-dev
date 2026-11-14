import os
from PIL import Image

art_dir = r"C:\Users\96656\.gemini\antigravity\brain\fd5402bf-7cdd-4341-bf14-feec05bfa609"

for f in sorted(os.listdir(art_dir)):
    if f.startswith("responsive_") or f.startswith("verified_"):
        path = os.path.join(art_dir, f)
        img = Image.open(path)
        print(f"{f}: size={img.size}, mode={img.mode}")

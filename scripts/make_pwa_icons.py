import os
from PIL import Image

src_path = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/avatar_all_family.jpg'
base_dir = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy'
assets_dir = os.path.join(base_dir, 'assets')
os.makedirs(assets_dir, exist_ok=True)

im = Image.open(src_path)

# Generate 512x512
im512 = im.resize((512, 512), Image.Resampling.LANCZOS)
im512.save(os.path.join(assets_dir, 'icon-512.png'), format='PNG')
im512.save(os.path.join(base_dir, 'icon-512.png'), format='PNG')

# Generate 192x192
im192 = im.resize((192, 192), Image.Resampling.LANCZOS)
im192.save(os.path.join(assets_dir, 'icon-192.png'), format='PNG')
im192.save(os.path.join(base_dir, 'icon-192.png'), format='PNG')

# Generate 180x180 (apple-touch-icon)
im180 = im.resize((180, 180), Image.Resampling.LANCZOS)
im180.save(os.path.join(assets_dir, 'apple-touch-icon.png'), format='PNG')
im180.save(os.path.join(base_dir, 'apple-touch-icon.png'), format='PNG')

# Generate 64x64 (favicon)
im64 = im.resize((64, 64), Image.Resampling.LANCZOS)
im64.save(os.path.join(assets_dir, 'favicon.png'), format='PNG')
im64.save(os.path.join(base_dir, 'favicon.png'), format='PNG')

print("Successfully generated all PWA icons from avatar_all_family.jpg!")

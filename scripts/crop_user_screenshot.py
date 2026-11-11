import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from PIL import Image

img = Image.open('C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670/.user_uploaded/media_1793620751756_35b6adab.jpg')
w, h = img.size
print(f"Image size: {w}x{h}")

# Crop the first category card "طعام ومشتريات" and "الرصيد الفعلي الحالي"
# In a phone screenshot 1080x2400 (or similar)
# Let's crop hero cockpit and first row of cards
crop_cockpit = img.crop((0, int(h * 0.2), w, int(h * 0.6)))
crop_cockpit.save('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/scripts/crop_cockpit.png')
print("Cropped cockpit saved")

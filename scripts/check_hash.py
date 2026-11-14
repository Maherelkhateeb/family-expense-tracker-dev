import hashlib

p1 = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/avatar_all_family.jpg'
p2 = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/family_portrait.jpg'

with open(p1, 'rb') as f:
    h1 = hashlib.md5(f.read()).hexdigest()
with open(p2, 'rb') as f:
    h2 = hashlib.md5(f.read()).hexdigest()

print("avatar_all_family md5:", h1)
print("family_portrait md5:", h2)
print("Are they identical?", h1 == h2)

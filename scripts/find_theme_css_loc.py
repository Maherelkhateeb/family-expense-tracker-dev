import sys
sys.stdout.reconfigure(encoding='utf-8')
import re

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('/* 1. ذهبي ملكي (Royal Gold) */')
print("Found at:", idx)
print(content[idx-200:idx+300])

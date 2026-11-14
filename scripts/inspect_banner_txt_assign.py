import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find("bannerTxt.textContent =")
while idx != -1:
    print(text[idx-50:idx+200])
    print('---')
    idx = text.find("bannerTxt.textContent =", idx + 1)

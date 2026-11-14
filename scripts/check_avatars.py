with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(15330, 15370):
    line = lines[i]
    if "'" in line and ":" in line:
        key = line.split(':')[0].strip()
        print(f"Line {i+1}: {key}")

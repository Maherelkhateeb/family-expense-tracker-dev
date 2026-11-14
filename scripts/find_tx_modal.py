with open(r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'id="txModal"' in line or 'function openTxModal' in line:
            print(f"Line {i+1}: {line.strip()[:100]}")

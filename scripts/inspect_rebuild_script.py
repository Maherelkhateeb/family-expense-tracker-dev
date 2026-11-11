import sys

sys.stdout.reconfigure(encoding='utf-8')
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\apply_settings_rebuild.py", "r", encoding="utf-8") as f:
    text = f.read()

pos = text.find("emblemOptionButtonsGroup")
if pos != -1:
    print(text[pos-4000:pos-2400])

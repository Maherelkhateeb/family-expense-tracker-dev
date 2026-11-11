import os, glob

scripts = glob.glob(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\*.py")
for s in scripts:
    try:
        with open(s, "r", encoding="utf-8") as f:
            txt = f.read()
            if "media_1793622912321" in txt or "969b5ccd" in txt or "commitments_4cards" in txt:
                print("Found in script:", s)
    except:
        pass

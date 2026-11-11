import os

for root in [r"C:\Users\96656\AppData\Local\Programs\antigravity", r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy"]:
    for f in os.listdir(root):
        if f.startswith("verified_") or (f.endswith(".png") and "verified" in f):
            print("Found in", root, ":", f)
    scripts_dir = os.path.join(root, "scripts")
    if os.path.exists(scripts_dir):
        for f in os.listdir(scripts_dir):
            if "verified" in f:
                print("Found in", scripts_dir, ":", f)

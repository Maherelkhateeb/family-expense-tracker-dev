import shutil, os

art_dir = r"C:\Users\96656\.gemini\antigravity\brain\fd5402bf-7cdd-4341-bf14-feec05bfa609"
scr_dir = r"C:\Users\96656\AppData\Local\Programs\antigravity\scripts"

files = [
    "verified_cockpit.png",
    "verified_commitments_cards.png",
    "verified_budgets_panel.png",
    "verified_new_budget_modal.png",
    "verified_budgets_with_new_item.png"
]

for f in files:
    src = os.path.join(scr_dir, f)
    dst = os.path.join(art_dir, f)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"Copied {f} to artifacts directory: {dst}")

import os, re

for root, dirs, files in os.walk(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy"):
    if ".git" in root: continue
    for f in files:
        if f.endswith(('.js', '.html', '.py')):
            path = os.path.join(root, f)
            try:
                with open(path, "r", encoding="utf-8") as file:
                    content = file.read()
                    matches = list(re.finditer(r'مكتمل', content))
                    if matches:
                        print(f"File {f}: {len(matches)} matches")
                        for m in matches[:3]:
                            print("  ", repr(content[max(0, m.start()-40):min(len(content), m.start()+60)]))
            except:
                pass

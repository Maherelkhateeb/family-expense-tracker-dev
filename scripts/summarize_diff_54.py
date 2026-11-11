# -*- coding: utf-8 -*-
import subprocess

cmd = ['git', 'diff', '545d563', '2e12ad3', '--', 'index.html']
p = subprocess.run(cmd, cwd=r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy', capture_output=True, text=True, encoding='utf-8', errors='replace')
diff = p.stdout

lines = diff.split('\n')
current_hunk = []
hunk_title = ""

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\diff_54_to_2e.txt", 'w', encoding='utf-8') as out:
    for line in lines:
        if line.startswith('@@'):
            if current_hunk:
                out.write(f"\n{hunk_title}\n")
                for l in current_hunk:
                    out.write(f"{l}\n")
            hunk_title = line
            current_hunk = []
        elif line.startswith('+') or line.startswith('-'):
            current_hunk.append(line)

    if current_hunk:
        out.write(f"\n{hunk_title}\n")
        for l in current_hunk:
            out.write(f"{l}\n")

print("Wrote diff_54_to_2e.txt")

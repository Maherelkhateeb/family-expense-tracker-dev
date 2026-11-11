import subprocess, sys

cmd = ["git", "show", "dea5bfa:index.html"]
r = subprocess.run(cmd, capture_output=True, cwd=r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy")
html = r.stdout.decode('utf-8', errors='replace')

pos = html.find('id="newBudgetPlanModal"')
start = html.rfind('<div class="modal-overlay', 0, pos)
end = html.find('</div>\n    </div>', pos) + len('</div>\n    </div>')

modal_html = html[start:end]
print(f"Extracted modal html: {len(modal_html)} bytes")

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\modal_new_budget_plan.html", "w", encoding="utf-8") as out:
    out.write(modal_html)

print("Saved to scripts/modal_new_budget_plan.html")

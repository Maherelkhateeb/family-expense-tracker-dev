with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    c = f.read()

# Replace all occurrences of clamp(1.05rem, 3.2vw, 1.25rem)
c = c.replace("clamp(1.05rem, 3.2vw, 1.25rem)", "clamp(0.78rem, 2.4vw, 0.94rem)")

# In cockpit-flow-pill padding: 7px 12px -> 6px 10px
c = c.replace("padding: 7px 12px !important;", "padding: 6px 10px !important;")

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "w", encoding="utf-8") as f:
    f.write(c)

print("Updated .flow-amount font size and pill padding")

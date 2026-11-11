# -*- coding: utf-8 -*-
FILE = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(FILE, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("=== Lines 13830-13845 ===")
for i in range(13829, min(len(lines), 13846)):
    print(f"L{i+1}: {lines[i].strip()}")

print("\n=== Lines 15215-15230 ===")
for i in range(15214, min(len(lines), 15231)):
    print(f"L{i+1}: {lines[i].strip()}")

print("\n=== Lines 15680-15700 ===")
for i in range(15679, min(len(lines), 15701)):
    print(f"L{i+1}: {lines[i].strip()}")

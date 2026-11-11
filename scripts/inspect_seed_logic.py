# -*- coding: utf-8 -*-
FILE = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(FILE, 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find("DATA_SEED_VERSION = 'v4.0_clean_1000';")
if pos != -1:
    print(text[pos-100:pos+1500])

# -*- coding: utf-8 -*-
import re

FILE = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(FILE, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Search for places where state.transactions is set or overwritten
tx_overwrites = re.findall(r'state\.transactions\s*=\s*[^;]+;', text)
print("=== state.transactions assignments ===")
for t in tx_overwrites:
    print("  ", t[:100])

# 2. Search for DATA_SEED_VERSION logic
seed_matches = re.findall(r'DATA_SEED_VERSION[\s\S]{0,400}', text)
print("\n=== DATA_SEED_VERSION logic ===")
for s in seed_matches[:2]:
    print(s[:250])

# 3. Check for any NaN or undefined in calculations
print("\n=== Check for parseFloat/parseInt without fallback ===")
unsafe_parse = re.findall(r'parseFloat\([^)]+\)(?!\s*\|\|\s*0)', text)
print(f"parseFloat without fallback || 0: {len(unsafe_parse)}")

# 4. Check for unclosed divs or syntax anomalies
open_divs = len(re.findall(r'<div\b', text, re.IGNORECASE))
close_divs = len(re.findall(r'</div>', text, re.IGNORECASE))
print(f"\nHTML <div> balance: open={open_divs}, close={close_divs}, diff={open_divs - close_divs}")

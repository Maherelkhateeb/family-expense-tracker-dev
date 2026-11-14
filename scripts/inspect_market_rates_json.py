import sys, io, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('market_rates.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("market_rates.json content:")
print(json.dumps(data, indent=2, ensure_ascii=False))

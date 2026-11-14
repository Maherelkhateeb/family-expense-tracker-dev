with open('scripts/apply_master_upgrades.py', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('selectTaskDatePreset')
print(text[pos-200:pos+1500])

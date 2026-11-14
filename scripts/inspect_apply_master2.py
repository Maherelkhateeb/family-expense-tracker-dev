with open('scripts/apply_master_upgrades.py', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function openTaskDateTimePickerModal')
if pos == -1:
    pos = text.find('openTaskDateTimePickerModal')

print(text[pos:pos+2500])

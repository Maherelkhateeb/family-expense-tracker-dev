with open('scripts/apply_master_upgrades.py', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function confirmTaskDateTimePicker')
with open('scripts/picker_extracted.js', 'w', encoding='utf-8') as f_out:
    f_out.write(text[pos-1000:pos+2500])

print("Written picker extracted to scripts/picker_extracted.js")

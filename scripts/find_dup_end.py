import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos2 = 1934246
# Find what comes after that block
pos_next_section = text.find('// =========================================================================\n    // نظام المزامنة والنسخ الاحتياطي', pos2)
if pos_next_section == -1:
    pos_next_section = text.find('function initApp(', pos2)
print("pos_next_section:", pos_next_section)
print(text[pos_next_section-500:pos_next_section+500])

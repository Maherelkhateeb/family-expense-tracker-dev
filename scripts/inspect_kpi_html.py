import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/view_expected_structure.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx_cockpit = text.find('id="expectedKpiCockpit"')
if idx_cockpit != -1:
    print(text[idx_cockpit-100:idx_cockpit+2500])

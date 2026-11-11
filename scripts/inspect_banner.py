import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/view_expected_structure.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx_banner = text.find('id="expectedNetPositionBanner"')
if idx_banner != -1:
    print(text[idx_banner-200:idx_banner+1000])

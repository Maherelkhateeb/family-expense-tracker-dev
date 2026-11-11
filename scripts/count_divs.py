import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx_start = text.find('id="subViewCommitments"')
idx_strip = text.find('id="budgetsSubTabStrip"')

sub = text[idx_start:idx_strip]

# Count opening and closing divs in sub
open_divs = len(re.findall(r'<\s*div[\s>]', sub, re.IGNORECASE))
close_divs = len(re.findall(r'<\s*/\s*div\s*>', sub, re.IGNORECASE))

print(f"Inside subViewCommitments up to budgetsSubTabStrip: {open_divs} opening divs, {close_divs} closing divs.")
print(f"Difference (unclosed divs): {open_divs - close_divs}")

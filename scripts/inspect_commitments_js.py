import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's inspect where state.expected or state.commitments or state.bills are used
state_matches = list(re.finditer(r'state\.(expected|commitments|bills)', html))
print(f"State references: {len(state_matches)}")
for m in state_matches[:10]:
    start = max(0, m.start() - 80)
    end = min(len(html), m.start() + 150)
    print(f"[{m.start()}]:\n{html[start:end]}\n---")

# Let's see renderExpectedList and saveExpected
idx_render = html.find('function renderExpectedList()')
if idx_render != -1:
    print("\n=== renderExpectedList ===")
    print(html[idx_render:idx_render+3000])

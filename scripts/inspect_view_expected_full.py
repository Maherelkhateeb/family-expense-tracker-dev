import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('id="viewExpected"')
end_idx = content.find('id="viewChart"')
print(f'viewExpected block size: {end_idx - start_idx} chars (from {start_idx} to {end_idx})')

# Find all section ids inside viewExpected
sub = content[start_idx:end_idx]
ids = re.findall(r'id="([^"]+)"', sub)
print('IDs inside viewExpected:')
for i in ids:
    print('  ', i)

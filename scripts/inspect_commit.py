import sys, re
sys.stdout.reconfigure(encoding='utf-8')
content = open('index.html', encoding='utf-8').read()

# Find the commitments section - large chunk
idx_section = content.find('التخطيط المالي والالتزامات', 566000)
print('Section header at:', idx_section)

# Get a large chunk around the commitments section - look 2000 chars before
chunk_before = content[idx_section-2000:idx_section+100]
ids = list(re.finditer(r'id="([^"]+)"', chunk_before))
print('IDs before section:')
for m in ids[-5:]:
    print(' ', m.group(1))

# Write large section to file for inspection
chunk = content[idx_section-2000:idx_section+8000]
open('scripts/commit_section.txt', 'w', encoding='utf-8').write(chunk)
print('Written commit_section.txt, size:', len(chunk))

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

sub_start = text.find('id="subViewCommitments"')
import re
print("IDs after subViewCommitments:")
for m in re.finditer(r'id="([^"]+)"', text[sub_start:sub_start+20000]):
    print(' -', m.group(1))

with open('scripts/commitments_block.html', 'w', encoding='utf-8') as f_out:
    f_out.write(text[sub_start-500:sub_start+25000])

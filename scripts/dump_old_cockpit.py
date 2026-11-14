import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

chunk = text[570974:580619]
with open('scripts/old_cockpit_block.html', 'w', encoding='utf-8') as f_out:
    f_out.write(chunk)
print('old_cockpit_block.html size:', len(chunk))

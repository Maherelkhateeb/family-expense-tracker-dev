import re, sys

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

in_script = False
script_idx = 0

for line_no, line in enumerate(lines, 1):
    if '<script' in line and not in_script:
        in_script = True
        script_idx += 1
        stack = []
        continue
    if '</script>' in line and in_script:
        in_script = False
        continue
    if in_script:
        # Check braces roughly
        pass

# Better: inspect scripts/summary_script_tag.js which had the task functions we modified!
with open('scripts/summary_script_tag.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's count braces in summary_script_tag.js
open_count = content.count('{')
close_count = content.count('}')
print(f"summary_script_tag.js has {open_count} '{{' and {close_count} '}}'")

# Let's find where the mismatch happens line by line
lines = content.split('\n')
depth = 0
for i, l in enumerate(lines, 1):
    # remove strings and comments to be reasonably accurate
    clean_l = re.sub(r'//.*$', '', l)
    clean_l = re.sub(r'"(?:\\.|[^"\\])*"', '""', clean_l)
    clean_l = re.sub(r"'(?:\\.|[^'\\])*'", "''", clean_l)
    clean_l = re.sub(r"`(?:\\.|[^`\\])*`", "``", clean_l)
    for ch in clean_l:
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth < 0:
                print(f"Brace dropped below 0 at line {i}: {l.strip()}")
                depth = 0
print(f"Final depth: {depth}")

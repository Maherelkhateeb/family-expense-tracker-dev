import sys
sys.stdout.reconfigure(encoding='utf-8')
import re

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

script_start_line = None
for i, l in enumerate(lines):
    if i > 11965 and '<script' in l:
        script_start_line = i
        break

print(f"Checking HTML body from line 11966 to {script_start_line+1}...")

stack = []
extra_closing = []
for i in range(11965, script_start_line):
    l = lines[i]
    for m in re.finditer(r'(<div[^>]*>|</div>)', l):
        tag = m.group(1)
        if tag.startswith('<div'):
            id_m = re.search(r'id=["\']([^"\']+)["\']', tag)
            cl_m = re.search(r'class=["\']([^"\']+)["\']', tag)
            desc = id_m.group(1) if id_m else (cl_m.group(1) if cl_m else 'div')
            stack.append((i+1, desc))
        else:
            if stack:
                opened_line, opened_desc = stack.pop()
            else:
                extra_closing.append((i+1, l.strip()))

print(f"Extra closing divs: {len(extra_closing)}")
for lno, text in extra_closing:
    print(f"  Line {lno}: {text}")

print(f"Unclosed divs remaining: {len(stack)}")
for lno, desc in stack:
    print(f"  Line {lno}: {desc}")

if len(extra_closing) == 0 and len(stack) == 0:
    print("\nPERFECTION! HTML DOM <div> BALANCE IS 100% BALANCED (DIFF = 0)!")

import sys
sys.stdout.reconfigure(encoding='utf-8')
import re

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

stack = []
for i in range(11965, 13845):
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
                if 'app' in opened_desc.lower() or 'view' in opened_desc.lower() or i+1 > 13770:
                    print(f"Line {i+1}: popped {opened_desc} (opened at line {opened_line})")
            else:
                print(f"EXTRA CLOSING DIV at line {i+1}: {l.strip()}")

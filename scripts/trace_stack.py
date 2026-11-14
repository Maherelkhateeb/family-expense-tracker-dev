import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

stack = []
for i in range(13282, 13790):
    l = lines[i]
    import re
    # find all tags in line
    for m in re.finditer(r'(<div[^>]*>|</div>)', l):
        tag = m.group(1)
        if tag.startswith('<div'):
            # extract id or class
            id_m = re.search(r'id=["\']([^"\']+)["\']', tag)
            cl_m = re.search(r'class=["\']([^"\']+)["\']', tag)
            desc = id_m.group(1) if id_m else (cl_m.group(1) if cl_m else 'div')
            stack.append((i+1, desc))
        else:
            if stack:
                opened_line, opened_desc = stack.pop()
                # print match if near end
                if i+1 >= 13780:
                    print(f"Closed {opened_desc} (from line {opened_line}) at line {i+1}")
            else:
                print(f"EXTRA CLOSING DIV at line {i+1}!")

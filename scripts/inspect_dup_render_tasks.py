import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'function\s+renderTasksProList\s*\(', text)]
print("Match 1:", matches[0])
print("Match 2:", matches[1])

print("--- Start of Match 2 ---")
print(text[matches[1]:matches[1]+1000])

# Find end of Match 2
next_func = text.find('\n    function ', matches[1] + 50)
print("--- Next function after Match 2 ---")
print(text[next_func:next_func+300])

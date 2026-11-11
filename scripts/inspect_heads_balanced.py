import sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's search for modal heads and print their full opening to closing tag
for idx in [4, 5, 8, 9, 11, 18, 21, 22]:
    m = list(re.finditer(r'<div class="[^"]*modal-head[^"]*"[^>]*>', text))[idx]
    # find closing </div> matching this div
    start = m.start()
    depth = 0
    end = start
    for j in range(start, start + 2000):
        if text[j:j+4] == '<div':
            depth += 1
        elif text[j:j+6] == '</div>':
            depth -= 1
            if depth == 0:
                end = j + 6
                break
    print(f'=== Modal Head {idx+1} ===')
    print(text[start:end])

import sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect all modal headers, subheadings, helper texts, and alerts
modal_matches = re.findall(r'(<div class="modal(?:-content-card|-head)?[^"]*"[^>]*>.*?</div>)', text, re.DOTALL)
print(f'Modals found: {len(modal_matches)}')

# Find all headings with subtitles or descriptive text under them
subtitles = re.findall(r'(<(?:h1|h2|h3|h4|h5)[^>]*>.*?</(?:h1|h2|h3|h4|h5)>\s*<(?:p|small|div|span)[^>]*>.*?</(?:p|small|div|span)>)', text)
print(f'Headings with subtitles: {len(subtitles)}')
for s in subtitles[:25]:
    clean = re.sub(r'<[^>]+>', ' | ', s).strip()
    clean = re.sub(r'\s+', ' ', clean)
    print(clean[:120])

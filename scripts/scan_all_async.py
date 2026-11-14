import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Find all occurrences of "async"
matches = [m.start() for m in re.finditer(r'\basync\b', text)]
print(f"Total occurrences of 'async': {len(matches)}")

for i, pos in enumerate(matches):
    context = text[max(0, pos-40):min(len(text), pos+100)].replace('\n', ' ')
    print(f"#{i} at {pos}: {context}")

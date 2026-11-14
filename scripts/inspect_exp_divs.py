import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m_exp = re.search(r'<div[^>]*id=["\']viewExpected["\']', html)
exp_start = m_exp.start()
print("viewExpected starts at:", exp_start)

m_nav = re.search(r'<nav[^>]*id=["\']appBottomNav["\']', html)
nav_start = m_nav.start()
print("appBottomNav starts at:", nav_start)

# Count open and close divs between exp_start and nav_start
sub = html[exp_start:nav_start]
open_tags = [m.start() for m in re.finditer(r'<div\b', sub)]
close_tags = [m.start() for m in re.finditer(r'</div\b', sub)]
print(f"Open divs: {len(open_tags)}, Close divs: {len(close_tags)}")
print(f"Difference (unclosed divs): {len(open_tags) - len(close_tags)}")

# Let's inspect the end of viewExpected before <nav>
print("Snippet before <nav>:")
print(html[nav_start-500:nav_start])

import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'<nav[^>]*id=["\']appBottomNav["\']', html)
if m:
    nav_pos = m.start()
    # Search backwards for open div tags
    tags = []
    # Let's count open divs from <body> to nav_pos
    body_idx = html.find('<body')
    sub = html[body_idx:nav_pos]
    open_divs = len(re.findall(r'<div\b', sub))
    close_divs = len(re.findall(r'</div\b', sub))
    print(f"Open divs between <body> and <nav>: {open_divs}, Close divs: {close_divs}, Difference: {open_divs - close_divs}")
    
    # Check parent element right before <nav>
    print("Preceding 2000 chars before <nav>:")
    print(html[nav_pos-1000:nav_pos])

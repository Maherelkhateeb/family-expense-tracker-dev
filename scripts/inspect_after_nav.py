import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m_nav = re.search(r'<nav[^>]*id=["\']appBottomNav["\']', html)
nav_start = m_nav.start()
m_nav_end = html.find('</nav>', nav_start)
print("Nav starts at:", nav_start, "ends at:", m_nav_end)

print("Snippet after </nav>:")
print(html[m_nav_end:m_nav_end+1500])

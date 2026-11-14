import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'\.app-bottom-nav\s*\{[^}]*position:\s*fixed[^}]*\}', html)
if m:
    print("=== .app-bottom-nav definition ===")
    print(m.group(0))

m_var = re.search(r'--app-bottom-nav-h:[^;]+;', html)
if m_var:
    print("=== --app-bottom-nav-h ===")
    print(m_var.group(0))
else:
    print("--app-bottom-nav-h NOT FOUND in :root!")

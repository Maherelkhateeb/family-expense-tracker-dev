import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m_hdr = re.search(r'<header[^>]*class=["\'][^"\']*app-header', html)
if m_hdr:
    start = m_hdr.start()
    end = html.find('</header>', start)
    print("=== app-header HTML ===")
    print(html[start:end+9])

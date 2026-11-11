import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m_nav = re.search(r'<nav[^>]*id=["\']appBottomNav["\']', html)
nav_pos = m_nav.start()

body_pos = html.find('<body')
sub = html[body_pos:nav_pos]

stack = []
tokens = re.finditer(r'(</?([a-zA-Z0-9\-]+)[^>]*>)', sub)
for token in tokens:
    tag_str = token.group(1)
    tag_name = token.group(2).lower()
    
    # Ignore void tags
    if tag_name in ['img', 'br', 'hr', 'input', 'meta', 'link']:
        continue
    
    if tag_str.startswith('</'):
        if stack and stack[-1][0] == tag_name:
            stack.pop()
        else:
            # find matching in stack
            for i in range(len(stack)-1, -1, -1):
                if stack[i][0] == tag_name:
                    stack = stack[:i]
                    break
    elif not tag_str.endswith('/>'):
        # extract id or class
        m_id = re.search(r'id=["\']([^"\']+)["\']', tag_str)
        m_cls = re.search(r'class=["\']([^"\']+)["\']', tag_str)
        info = f"{tag_name}"
        if m_id: info += f"#{m_id.group(1)}"
        if m_cls: info += f".{m_cls.group(1).replace(' ', '.')}"
        stack.append((tag_name, info))

print("Current DOM stack directly wrapping <nav id='appBottomNav'>:")
for tag, info in stack:
    print(" ->", info)

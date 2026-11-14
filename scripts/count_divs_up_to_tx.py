import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

body_idx = html.find('<body')
tx_idx = html.find('id="txModal"')

sub = html[body_idx:tx_idx]
open_divs = len(re.findall(r'<div\b', sub))
close_divs = len(re.findall(r'</div\b', sub))
print(f"Between <body> and txModal: open divs = {open_divs}, close divs = {close_divs}, difference = {open_divs - close_divs}")

import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

pages = ['viewExpenses', 'viewOperations', 'viewAnalytics', 'viewRequests', 'viewExpected']
starts = []
for pid in pages:
    m = re.search(r'<div[^>]*id=["\']' + pid + r'["\']', html)
    starts.append((pid, m.start()))

starts.append(('appBottomNav', html.find('id="appBottomNav"')))

for i in range(len(starts)-1):
    pid, pstart = starts[i]
    next_pid, next_start = starts[i+1]
    sub = html[pstart:next_start]
    open_d = len(re.findall(r'<div\b', sub))
    close_d = len(re.findall(r'</div\b', sub))
    print(f"{pid} -> {next_pid}: length={len(sub)}, open_divs={open_d}, close_divs={close_d}, diff={open_d - close_d}")

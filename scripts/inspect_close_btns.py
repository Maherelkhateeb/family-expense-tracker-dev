import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

modals = ['txModal', 'panelNewExpected', 'panelBillsExpected', 'incomeChoiceModal', 'editTxModal', 'quickReqModal']
for m_id in modals:
    m = re.search(r'id=["\']' + m_id + r'["\']', html)
    if m:
        start = m.start()
        snippet = html[start-50:start+1200]
        has_close_btn = ('closeModal' in snippet or 'toggleExpectedPanel' in snippet or 'toggleBillsPanel' in snippet or '&times;' in snippet)
        print(f"[{m_id}] close btn found: {has_close_btn}")
        print(snippet[:300])
        print("="*40)
    else:
        print(f"[{m_id}] NOT FOUND!")

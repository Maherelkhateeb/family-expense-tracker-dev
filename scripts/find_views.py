with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('id="viewExpected"')
print('start:', start)

# find closing div or next major comment
import re
for m in re.finditer(r'<div\s+class="page-view"|<div\s+id="view[A-Z]', text[start+20:]):
    print('found next view at:', start + 20 + m.start(), m.group(0))
    break

# Also find where subViewCommitments is
sub_start = text.find('id="subViewCommitments"')
print('subViewCommitments start:', sub_start)
sub_end = text.find('id="subViewMonthlyBudget"')
print('subViewMonthlyBudget start:', sub_end)

if sub_start != -1 and sub_end != -1:
    with open('scripts/subview_commitments.html', 'w', encoding='utf-8') as f_out:
        f_out.write(text[sub_start:sub_end])
    print('wrote subview_commitments.html, size:', sub_end - sub_start)

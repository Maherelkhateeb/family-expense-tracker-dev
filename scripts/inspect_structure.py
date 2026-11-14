import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

sub_start = text.find('id="viewExpected"')
sub_end = text.find('id="expectedListContainer"')
print('viewExpected to expectedListContainer length:', sub_end - sub_start)

# Let's save this region to inspect it
with open('scripts/view_expected_structure.html', 'w', encoding='utf-8') as f_out:
    f_out.write(text[sub_start:sub_end+1000])
print('Saved scripts/view_expected_structure.html')

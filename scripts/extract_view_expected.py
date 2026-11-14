with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('id="viewExpected"')
print('start:', start)
next_view = text.find('class="page-view"', start + 30)
print('next_view:', next_view)
view_html = text[start-50:next_view]
with open('scripts/full_view_expected.html', 'w', encoding='utf-8') as f_out:
    f_out.write(view_html)
print('written size:', len(view_html))

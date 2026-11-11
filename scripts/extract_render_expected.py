with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('function renderExpectedList(')
print('start:', start)
# find end of function
end = text.find('\n    function ', start + 30)
if end == -1:
    end = text.find('\n  function ', start + 30)

with open('scripts/renderExpectedList.js', 'w', encoding='utf-8') as f_out:
    f_out.write(text[start:end if end != -1 else start + 8000])

print('wrote renderExpectedList.js, size:', (end - start) if end != -1 else 8000)

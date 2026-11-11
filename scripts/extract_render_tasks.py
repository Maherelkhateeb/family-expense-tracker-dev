with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('function renderTasksProList(')
print('start:', start)
end = text.find('\n    function ', start + 100)
if end == -1:
    end = text.find('\n  function ', start + 100)

with open('scripts/renderTasksProList.js', 'w', encoding='utf-8') as f_out:
    f_out.write(text[start:end])
print('wrote renderTasksProList.js, size:', end - start)

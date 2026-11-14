with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('id="taskModalTimeChips"')
with open('scripts/time_chips.html', 'w', encoding='utf-8') as f_out:
    f_out.write(text[pos:pos+800])

print("Written time chips to scripts/time_chips.html")

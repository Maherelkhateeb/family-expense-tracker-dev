import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

keywords = ["ملخص المصروفات بالفرد", "تحليل دقيق لنفقات وبنود كل فرد", "كافة أفراد الأسرة"]
for kw in keywords:
    pos = text.find(kw)
    print(f"Keyword '{kw}' at index: {pos}")
    if pos != -1:
        print(text[pos-100:pos+400])

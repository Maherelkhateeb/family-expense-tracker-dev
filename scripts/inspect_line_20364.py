with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(20350, min(len(lines), 20385)):
    print(f"{i+1}: {lines[i].rstrip()}")

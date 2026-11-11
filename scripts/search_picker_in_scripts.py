import os

for root, dirs, files in os.walk('scripts'):
    for file in files:
        if file.endswith('.py') or file.endswith('.js'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                if 'selectTaskDatePreset' in content:
                    print(f"Found in {path}")
            except:
                pass

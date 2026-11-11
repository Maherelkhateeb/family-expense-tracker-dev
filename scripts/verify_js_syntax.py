import re, subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

scripts = re.findall(r'<script\b[^>]*>([\s\S]*?)</script>', content)
print(f"Found {len(scripts)} script tags in index.html")

has_error = False
for idx, s in enumerate(scripts):
    if not s.strip():
        continue
    # write to temp file
    with open('scripts/temp_eval.js', 'w', encoding='utf-8') as out:
        out.write(s)
    res = subprocess.run(['node', '--check', 'scripts/temp_eval.js'], capture_output=True, text=True, encoding='utf-8')
    if res.returncode != 0:
        print(f"❌ Syntax error in script tag {idx}:")
        print(res.stderr[:500])
        has_error = True
    else:
        print(f"✓ Script tag {idx} passed syntax check ({len(s)} chars)")

if not has_error:
    print("\n🎉 ALL script tags passed syntax check perfectly!")
else:
    sys.exit(1)

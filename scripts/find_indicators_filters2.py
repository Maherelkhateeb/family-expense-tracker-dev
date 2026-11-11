with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'id=["\']([^"\']*(?:indicat|filter|analyt|stat|metric|gauge|cockpit)[^"\']*)["\']', text, re.I)

with open('scripts/indicators_findings.txt', 'w', encoding='utf-8') as f_out:
    f_out.write(f"Total matching IDs: {len(matches)}\n")
    for m in sorted(set(matches)):
        f_out.write(f" - {m}\n")

    f_out.write("\nOccurrences of 'مؤشر' in HTML:\n")
    for m in re.finditer(r'([^>\n]*مؤشر[^<\n]*)', text):
        line = m.group(1).strip()
        if len(line) < 140:
            f_out.write(f"  * {line}\n")
            
    f_out.write("\nBottom nav tabs:\n")
    for m in re.finditer(r'<button[^>]*navTab[^>]*>.*?</button>', text, re.DOTALL):
        f_out.write(m.group(0) + "\n---\n")

print("Written findings.")

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

with open('scripts/generate_tasks_engine_v523.js', 'r', encoding='utf-8') as f_js:
    tasks_engine_code = f_js.read()

import re
scripts = list(re.finditer(r'<script\b[^>]*>(.*?)</script>', text, re.DOTALL))
s5 = scripts[5]
s5_start = s5.start()
s5_end = s5.end()
s5_content = s5.group(1)

# Ensure tasks engine is not already in s5
if 'TASKS & CALENDAR ENGINE PRO (v5.2.3 Master Unified)' in s5_content:
    print("Tasks engine already present in Script #5")
else:
    new_s5_content = s5_content.rstrip() + "\n\n" + tasks_engine_code + "\n"
    new_text = text[:s5_start] + f"<script>\n{new_s5_content}</script>" + text[s5_end:]
    with open('index.html', 'w', encoding='utf-8') as f_out:
        f_out.write(new_text)
    print("Successfully appended Tasks & Calendar Engine to Script #5!")

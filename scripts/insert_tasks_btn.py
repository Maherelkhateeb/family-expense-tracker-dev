import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('id="btnOpenSummaryDrawer"')
start = text.rfind('<button', 0, pos)
end = text.find('</button>', pos) + 9

exact_btn = text[start:end]

tasks_btn = """

          <!-- زر درج المهام والالتزامات العائلية والخطوات الفرعية (1-tap shortcut) -->
          <button type="button" class="tool-pill-action" id="btnOpenTasksDrawer" onclick="openSummaryDrawer('tasks')" title="إدارة المهام والالتزامات العائلية والخطوات الفرعية" style="height: 38px; padding: 0 10px; border-radius: 12px; font-size: 0.74rem; font-weight: 800; display: flex; align-items: center; gap: 5px; cursor: pointer; border: 1.2px solid rgba(168, 85, 247, 0.5); background: linear-gradient(135deg, rgba(168, 85, 247, 0.20), rgba(15, 23, 42, 0.9)); color: #c084fc; flex-shrink: 0;">
            <i class="fa-solid fa-list-check" style="color: #c084fc;"></i>
            <span>المهام</span>
          </button>"""

new_text = text[:end] + tasks_btn + text[end:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_text)

print("Added btnOpenTasksDrawer successfully!")

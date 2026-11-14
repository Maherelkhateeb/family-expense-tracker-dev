import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    c = f.read()

target = '''        <button type="button" class="btn-export-tool" onclick="closeModal('settingsModal')" style="padding: 5px 16px; font-size: 0.74rem; font-weight: 800; border-radius: 8px;">
          إغلاق
        </button>
      </div>

    </div>
  </div>'''

replacement = '''        <button type="button" class="btn-export-tool" onclick="closeModal('settingsModal')" style="padding: 5px 16px; font-size: 0.74rem; font-weight: 800; border-radius: 8px;">
          إغلاق
        </button>
      </div>

    </div>'''

if target in c:
    c = c.replace(target, replacement, 1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(c)
    print("Removed extra closing div successfully!")
else:
    print("Target not found!")

import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

FILE_PATH = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

with open(FILE_PATH, 'r', encoding='utf-8') as f:
    html = f.read()

# Polish header-brand-row and buttons
old_header_box = """        <div class="brand-box" style="display: flex; align-items: center; gap: 0;">
          <!-- زر المهام الرئيسي الفاخر في أعلى الصفحة الرئيسية بدلاً من الشعار المحذوف تماماً وبدون أي فراغ -->
          <button type="button" class="header-tasks-main-btn" id="btnHeaderTasksTop" onclick="openTasksFullScreenModal()" title="إدارة المهام والتخطيط اليومي" style="height: 34px; padding: 0 12px; border-radius: 10px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.28), rgba(99, 102, 241, 0.28)); border: 1.2px solid rgba(168, 85, 247, 0.55); color: #f8fafc; font-size: 0.82rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 3px 12px rgba(168, 85, 247, 0.35); transition: all 0.2s;">
            <i class="fa-solid fa-list-check" style="color: #c084fc; font-size: 0.92rem;"></i>
            <span>المهام</span>
            <span id="headerTasksBadgeCount" style="background: #a855f7; color: #ffffff; font-size: 0.65rem; padding: 1px 6px; border-radius: 10px; font-weight: 900; box-shadow: 0 1px 4px rgba(0,0,0,0.4);">0</span>
          </button>
        </div>"""

new_header_box = """        <div class="brand-box" style="display: flex; align-items: center; gap: 0; flex-shrink: 0;">
          <!-- زر المهام الرئيسي الفاخر في أعلى الصفحة الرئيسية في مكان الشعار المحذوف تماماً وبدون أي فراغ -->
          <button type="button" class="header-tasks-main-btn" id="btnHeaderTasksTop" onclick="openTasksFullScreenModal()" title="إدارة المهام والتخطيط اليومي" style="height: 32px; padding: 0 9px; border-radius: 9px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.32), rgba(99, 102, 241, 0.32)); border: 1.2px solid rgba(168, 85, 247, 0.6); color: #f8fafc; font-size: 0.76rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 10px rgba(168, 85, 247, 0.3); transition: all 0.2s; white-space: nowrap;">
            <i class="fa-solid fa-list-check" style="color: #c084fc; font-size: 0.86rem;"></i>
            <span>المهام</span>
            <span id="headerTasksBadgeCount" style="background: #a855f7; color: #ffffff; font-size: 0.62rem; padding: 1px 5px; border-radius: 8px; font-weight: 900;">0</span>
          </button>
        </div>"""

html = html.replace(old_header_box, new_header_box)

# Polish header buttons cluster
old_cluster = """        <div style="display: flex; align-items: center; gap: 5px;">"""
new_cluster = """        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">"""
html = html.replace(old_cluster, new_cluster, 1)

with open(FILE_PATH, 'w', encoding='utf-8') as f:
    f.write(html)

print("✓ Polished header spacing successfully.")

import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import re

INDEX_PATH = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    html = f.read()

old_block = """      // 5. ضبط قائمة تصفية العضو (Member Filter)
      const memSelect = document.getElementById('opsFilterMember');
      let targetMember = (member && member !== 'الكل' && member !== 'العائلة') ? member : 'all';
      if (memSelect) {
        memSelect.value = targetMember;
      }
      state.currentMemberFilter = targetMember === 'all' ? 'الكل' : targetMember;
      state.selectedMember = state.currentMemberFilter;
      if (targetMember !== 'all') {
        state.currentMemberFilter = targetMember;
        state.selectedMember = targetMember;
        document.querySelectorAll('.avatar-card').forEach(c => {
          if (c.getAttribute('data-member') === targetMember) c.classList.add('active');
          else c.classList.remove('active');
        });
      } else {
        state.currentMemberFilter = 'الكل';
        state.selectedMember = 'الكل';
        document.querySelectorAll('.avatar-card').forEach(c => {
          if (c.getAttribute('data-member') === 'الكل') c.classList.add('active');
          else c.classList.remove('active');
        });
      }"""

new_block = """      // 5. ضبط قائمة تصفية العضو (Member Filter)
      const memSelect = document.getElementById('opsFilterMember');
      let targetMember = (member && member !== 'الكل' && member !== 'العائلة') ? member : 'all';
      if (memSelect) {
        const opt = Array.from(memSelect.options).find(o => 
          o.value === targetMember || 
          ((targetMember === 'أية' || targetMember === 'آية') && (o.value === 'آية' || o.value === 'أية'))
        );
        if (opt) {
          memSelect.value = opt.value;
          targetMember = opt.value;
        } else {
          memSelect.value = targetMember;
        }
      }
      state.currentMemberFilter = targetMember === 'all' ? 'الكل' : targetMember;
      state.selectedMember = state.currentMemberFilter;
      document.querySelectorAll('.avatar-card').forEach(c => {
        const mAttr = c.getAttribute('data-member');
        const isMatch = (targetMember === 'all' && mAttr === 'الكل') ||
          (mAttr === targetMember) ||
          ((targetMember === 'أية' || targetMember === 'آية') && (mAttr === 'أية' || mAttr === 'آية'));
        if (isMatch) c.classList.add('active');
        else c.classList.remove('active');
      });"""

if old_block in html:
    html = html.replace(old_block, new_block)
    print("[OK] Normalized member matching in openOperationsFiltered()")
else:
    print("[ERROR] old_block not found in html")

with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(html)

print("[OK] Saved index.html")

import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

file_path = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# -------------------------------------------------------------------------
# 1. FIX: Make sure initMemberPhotoPickers is called in initApp() and openTxModal()
# -------------------------------------------------------------------------

# Remove initMemberPhotoPickers from btnOpenActivityLog
old_activity_btn = """      safeEvent('btnOpenActivityLog', 'click', () => {
        openModal('activityLogModal');
        renderActivityLogUI();
      initMemberPhotoPickers();
      });"""

new_activity_btn = """      safeEvent('btnOpenActivityLog', 'click', () => {
        openModal('activityLogModal');
        renderActivityLogUI();
      });"""

if old_activity_btn in content:
    content = content.replace(old_activity_btn, new_activity_btn)
    print("Replaced old_activity_btn")
else:
    print("WARNING: old_activity_btn not found directly, checking regex")

# Add initMemberPhotoPickers() in initApp() startup
target_init_startup = """      // إطلاق الواجهة بأمان كامل ومحمي ضد أي توقف
      try { initUserEmailAuth(); } catch(e) { console.error('Email auth error:', e); }"""

replacement_init_startup = """      // إطلاق الواجهة بأمان كامل ومحمي ضد أي توقف
      try { if (typeof initMemberPhotoPickers === 'function') initMemberPhotoPickers(); } catch(e) { console.error('Member pickers error:', e); }
      try { initUserEmailAuth(); } catch(e) { console.error('Email auth error:', e); }"""

if target_init_startup in content:
    content = content.replace(target_init_startup, replacement_init_startup)
    print("Added initMemberPhotoPickers to initApp")

# Update openTxModal to ensure initMemberPhotoPickers is always called
target_open_tx = """    function openTxModal(type = 'expense', preCat = null) {
      currentModalType = type;"""

replacement_open_tx = """    function openTxModal(type = 'expense', preCat = null) {
      currentModalType = type;
      if (typeof initMemberPhotoPickers === 'function') {
        initMemberPhotoPickers();
      }"""

if target_open_tx in content:
    content = content.replace(target_open_tx, replacement_open_tx)
    print("Added initMemberPhotoPickers to openTxModal")

# Update selectTxMemberPicker to update badge
target_select_tx = """    function selectTxMemberPicker(memberId) {
      const inp = document.getElementById('inpTxMember');
      if (inp) inp.value = memberId;
      document.querySelectorAll('#txMemberPhotoPicker .member-photo-chip').forEach(chip => {
        const cId = chip.getAttribute('data-member-id');
        if (cId === memberId || (memberId === 'أية' && cId === 'آية') || (memberId === 'آية' && cId === 'أية')) chip.classList.add('active');
        else chip.classList.remove('active');
      });
    }"""

replacement_select_tx = """    function selectTxMemberPicker(memberId) {
      const inp = document.getElementById('inpTxMember');
      if (inp) inp.value = memberId;
      document.querySelectorAll('#txMemberPhotoPicker .member-photo-chip').forEach(chip => {
        const cId = chip.getAttribute('data-member-id');
        if (cId === memberId || (memberId === 'أية' && cId === 'آية') || (memberId === 'آية' && cId === 'أية')) chip.classList.add('active');
        else chip.classList.remove('active');
      });
      const badge = document.getElementById('txActiveMemberNameBadge');
      if (badge) badge.textContent = `${memberId} ✓`;
    }"""

if target_select_tx in content:
    content = content.replace(target_select_tx, replacement_select_tx)
    print("Updated selectTxMemberPicker")

# Update txModal HTML for the member picker to make it prominent and clear
target_tx_member_html = """        <!-- يخص من في العائلة؟ (شريط أفقي مضغوط وأنيق بالصور الحقيقية) -->
        <div class="form-group-custom" style="margin-bottom: 4px;">
          <label class="form-label-custom" style="font-size: 0.68rem; margin-bottom: 2px; display: block; font-weight: 700;">
            <i class="fa-solid fa-user-tag" style="color: #38bdf8;"></i> يخص من في العائلة؟ (بالصور الفعلية):
          </label>
          <input type="hidden" id="inpTxMember" value="البيت">
          <div class="member-photo-picker-strip" id="txMemberPhotoPicker" style="display: flex; gap: 5px; overflow-x: auto; padding-bottom: 2px;">
            <!-- تتولد تلقائياً بالصور الفعلية الحقيقية لأفراد العائلة -->
          </div>
        </div>"""

replacement_tx_member_html = """        <!-- يخص من في العائلة؟ (شريط أفقي بارز وأنيق بالصور الحقيقية) -->
        <div class="form-group-custom" id="txMemberSectionWrapper" style="margin-bottom: 5px; background: rgba(15, 23, 42, 0.65); border: 1.2px solid rgba(56, 189, 248, 0.25); border-radius: 12px; padding: 6px 8px;">
          <label class="form-label-custom" style="font-size: 0.72rem; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between; font-weight: 850; color: #cbd5e1;">
            <span><i class="fa-solid fa-user-tag" style="color: #38bdf8;"></i> يخص من في العائلة؟ (حدد الشخص المستفيد):</span>
            <span id="txActiveMemberNameBadge" style="font-size: 0.65rem; color: #38bdf8; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); padding: 1px 8px; border-radius: 6px; font-weight: 900;">البيت ✓</span>
          </label>
          <input type="hidden" id="inpTxMember" value="البيت">
          <div class="member-photo-picker-strip" id="txMemberPhotoPicker" style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 3px;">
            <!-- تتولد تلقائياً بالصور الفعلية الحقيقية لأفراد العائلة -->
          </div>
        </div>"""

if target_tx_member_html in content:
    content = content.replace(target_tx_member_html, replacement_tx_member_html)
    print("Updated txModal member HTML")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Saved Step 1 changes.")

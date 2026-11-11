# -*- coding: utf-8 -*-
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

modal_html = """
  <!-- ==============================================================
       نافذة تعديل بند الميزانية التقديري وربطه بأفراد الأسرة (v5.2.8)
       ============================================================== -->
  <div id="modalEditBudgetItem" class="custom-modal-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 2000000; align-items: center; justify-content: center; padding: 14px;">
    <div class="custom-modal-content" style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.96)); border: 1.5px solid rgba(56, 189, 248, 0.45); border-radius: 18px; width: 100%; max-width: 440px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); overflow: hidden; animation: popIn 0.25s ease;">
      <!-- الهيدر -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(15, 23, 42, 0.6);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(56, 189, 248, 0.2); border: 1px solid rgba(56, 189, 248, 0.4); display: flex; align-items: center; justify-content: center; color: #38bdf8;">
            <i class="fa-solid fa-pen-to-square"></i>
          </div>
          <h3 style="margin: 0; font-size: 0.95rem; font-weight: 900; color: #f8fafc;">تعديل بند المصروف التقديري</h3>
        </div>
        <button type="button" onclick="closeEditBudgetItemModal()" style="background: none; border: none; color: #94a3b8; font-size: 1.1rem; cursor: pointer; padding: 4px;">&times;</button>
      </div>

      <!-- الجسم -->
      <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px;">
        <input type="hidden" id="editBudgetItemId">
        <div>
          <label style="display: block; font-size: 0.74rem; font-weight: 800; color: #94a3b8; margin-bottom: 4px;">مسمى البند:</label>
          <input type="text" id="editBudgetItemTitle" class="form-control-custom" style="width: 100%; height: 38px; border-radius: 8px; font-weight: 800; font-size: 0.85rem;" placeholder="مثال: ملابس أية، مصروف المدرسة...">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="display: block; font-size: 0.74rem; font-weight: 800; color: #94a3b8; margin-bottom: 4px;">التصنيف:</label>
            <select id="editBudgetItemCategory" class="form-select-custom" style="width: 100%; height: 38px; border-radius: 8px; font-weight: 800; font-size: 0.82rem;">
              <!-- يتولد ديناميكياً -->
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 0.74rem; font-weight: 800; color: #94a3b8; margin-bottom: 4px;">المبلغ المقدر (ج.م):</label>
            <input type="number" step="any" id="editBudgetItemAmount" class="form-control-custom" style="width: 100%; height: 38px; border-radius: 8px; font-weight: 950; font-size: 0.92rem; color: #38bdf8;" placeholder="0.00">
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 0.74rem; font-weight: 800; color: #94a3b8; margin-bottom: 6px;">مخصص لمن من أفراد الأسرة؟ (ربط المصروف بشخص):</label>
          <div id="editBudgetItemMembersGrid" style="display: flex; flex-wrap: wrap; gap: 6px;">
            <!-- تتولد ديناميكياً بواسطة renderEditBudgetMembersGrid() -->
          </div>
        </div>
      </div>

      <!-- الأزرار -->
      <div style="display: flex; gap: 8px; justify-content: flex-end; padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.08); background: rgba(15, 23, 42, 0.4);">
        <button type="button" onclick="closeEditBudgetItemModal()" class="btn-wallet-action-pill" style="height: 36px; padding: 0 14px; background: rgba(255,255,255,0.08); color: #94a3b8; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; font-weight: 800; cursor: pointer;">إلغاء</button>
        <button type="button" onclick="saveEditedBudgetItem()" class="btn-wallet-action-pill" style="height: 36px; padding: 0 16px; background: linear-gradient(135deg, #0284c7, #10b981); color: #fff; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 8px; font-weight: 900; cursor: pointer; box-shadow: 0 3px 12px rgba(2, 132, 199, 0.4);">حفظ التعديلات ✨</button>
      </div>
    </div>
  </div>
"""

body_close = text.rfind('</body>')
if body_close != -1:
    text = text[:body_close] + modal_html + '\n' + text[body_close:]
    print("Injected modalEditBudgetItem successfully before </body>!")
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(text)
else:
    print("WARNING: </body> not found!")

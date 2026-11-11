#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def apply_updates():
    html_path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f"Original content length: {len(content)}")

    # =========================================================================
    # 1. تحديث كروت شبكة المصروفات (catGrid):
    # إزالة كلمتي تسجيل جديد / كشف، إبراز رمز البند بإطار داخلي للنقر لتسجيل مصروف،
    # وإبراز رقم المبلغ بإطار داخلي للنقر لفتح تفاصيل وكشف العمليات
    # =========================================================================
    old_cat_html_pattern = re.compile(
        r'card\.innerHTML\s*=\s*`\s*<!-- شريط الإجراءات المزدوج.*?<!-- 3\. كبسولة المبلغ المصروف.*?</div>\s*`;',
        re.DOTALL
    )

    new_cat_html = """card.innerHTML = `
          <!-- 1. صورة/أيقونة التصنيف ثلاثية الأبعاد الفاخرة بإطار داخلي بارز - النقر عليها يفتح تسجيل جديد -->
          <div class="cat-icon-bubble" 
               onclick="event.stopPropagation(); openQuickCategoryExpense('${cat.id}');"
               title="انقر على الرمز لتسجيل مصروف جديد في ${theme.name}"
               style="background: ${bubbleGradient}; width: var(--app-cat-bubble-size, clamp(42px, 11vw, 48px)); height: var(--app-cat-bubble-size, clamp(42px, 11vw, 48px)); min-width: 38px; min-height: 38px; border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45), inset 0 0 6px rgba(255, 255, 255, 0.35), 0 0 14px ${bubbleGlow}; border: 2.2px solid rgba(255, 255, 255, 0.6); outline: 1.5px solid ${theme.accent}; margin-top: 2px; flex-shrink: 0; cursor: pointer; transition: transform 0.15s ease;">
            <span style="font-size: var(--app-cat-emoji-size, clamp(1.70rem, 4.4vw, 2.05rem)); line-height: 1; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.45)); transform: translateZ(0);">${theme.emoji}</span>
          </div>

          <!-- 2. اسم التصنيف بخط عربي فخم وواضح متناسق بين الفاتح والداكن -->
          <div class="cat-label-text" 
               style="font-family: var(--font-family); font-size: var(--app-card-title-size, clamp(0.72rem, 2.2vw, 0.84rem)); font-weight: 800; color: ${catLabelColor} !important; text-align: center; margin: 2px 0 1px; width: 100%; max-width: 100%; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 2px; box-sizing: border-box;">
            ${theme.name}
          </div>

          <!-- 3. كبسولة المبلغ المصروف بإطار داخلي بارز - النقر عليها يفتح كشف العمليات والتفاصيل -->
          <div class="cat-amount-pill ${spent > 0 ? 'has-spent' : 'zero-spent'}" 
               onclick="event.stopPropagation(); openOperationsFiltered({ category: '${cat.id}', categoryName: '${cat.name}', type: 'expense' });" 
               title="انقر على الرقم لعرض كشف وتفاصيل حركات ${theme.name}" 
               style="cursor: pointer; background: ${pillBg}; border: 1.8px solid ${pillBorder}; color: ${pillTextColor}; padding: 3px 4px; border-radius: 9px; width: 98%; max-width: 98%; text-align: center; direction: rtl; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 3px; overflow: hidden; box-shadow: inset 0 0 8px ${spent > 0 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255, 255, 255, 0.08)'}; transition: all 0.15s ease;">
            <i class="fa-solid fa-list-ul" style="font-size: 0.58rem; opacity: 0.8; flex-shrink: 0;"></i>
            <span style="font-family: var(--font-numbers); font-size: var(--app-card-amt-size, ${pillFontSize}); letter-spacing: ${pillLetterSpacing}; font-weight: 900; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; font-variant-numeric: tabular-nums;">${amtDisplay}</span>
          </div>
        `;"""

    if old_cat_html_pattern.search(content):
        content = old_cat_html_pattern.sub(new_cat_html, content, count=1)
        print("✓ Updated catGrid card HTML")
    else:
        print("✗ Could not match catGrid pattern")

    # =========================================================================
    # 2. تكبير وإبراز رقم الرصيد الفعلي ورقم الإيداعات والمصروفات
    # وحذف أي ذكر لـ "صافي السيولة المعتمدة للمحافظ"
    # =========================================================================
    # تعديل الـ CSS لـ cockpit-hero-value و flow-amount
    content = re.sub(
        r'--app-cockpit-hero-val:\s*[^;]+;',
        '--app-cockpit-hero-val: clamp(1.65rem, 5.2vw, 2.20rem);',
        content
    )
    content = re.sub(
        r'\.cockpit-hero-value\s*\{\s*font-size:\s*var\(--app-cockpit-hero-val\)\s*!important;\s*\}',
        '.cockpit-hero-value { font-size: clamp(1.65rem, 5.2vw, 2.20rem) !important; font-weight: 950 !important; text-shadow: 0 2px 16px rgba(56, 189, 248, 0.55) !important; letter-spacing: -0.3px !important; }',
        content
    )
    content = re.sub(
        r'\.flow-amount\s*\{\s*font-weight:\s*900\s*!important;\s*font-variant-numeric:\s*tabular-nums\s*!important;\s*direction:\s*rtl\s*!important;\s*font-size:\s*0\.90rem\s*!important;',
        '.flow-amount { font-weight: 950 !important; font-variant-numeric: tabular-nums !important; direction: rtl !important; font-size: clamp(1.05rem, 3.2vw, 1.25rem) !important;',
        content
    )

    # تعديل حجم الرصيد المباشر في قمرة القيادة
    content = content.replace(
        'style="font-size: clamp(1.35rem, 4.4vw, 1.68rem) !important; font-weight: 950 !important; letter-spacing: -0.3px; text-shadow: 0 2px 14px rgba(56, 189, 248, 0.45); margin: auto 0; color: #38bdf8;"',
        'style="font-size: clamp(1.65rem, 5.2vw, 2.20rem) !important; font-weight: 950 !important; letter-spacing: -0.3px; text-shadow: 0 2px 18px rgba(56, 189, 248, 0.65); margin: auto 0; color: #38bdf8;"'
    )

    # =========================================================================
    # 3. تعديل وتنسيق كروت الالتزامات والديون (مصاريف قادمة، ديون علينا، ديون لنا، تم السداد):
    # جعل الاسم أكبر قليلاً، عدد البنود في المنتصف، والرقم في المنتصف
    # =========================================================================
    old_commitments_cockpit = re.compile(
        r'<div class="expected-kpi-cockpit" id="expectedKpiCockpit">.*?<!-- شريط صافي الالتزامات المستقبلية -->',
        re.DOTALL
    )

    new_commitments_cockpit = """<div class="expected-kpi-cockpit" id="expectedKpiCockpit">
            <!-- 1. مصاريف قادمة -->
            <div class="exp-kpi-card exp-card-amber" id="cardExpUpcoming" onclick="toggleExpectedFilter('upcoming_bill')" title="انقر لتصفية المصاريف والفواتير القادمة" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 10px 8px; border-radius: 13px;">
              <div class="exp-card-header" style="display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%;">
                <span style="font-size: 0.86rem; color: #fbbf24;"><i class="fa-solid fa-clock"></i></span>
                <span class="exp-kpi-title" style="font-size: clamp(0.80rem, 2.3vw, 0.92rem); font-weight: 900; color: #fde047; white-space: nowrap;">مصاريف قادمة</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: center; margin: 4px auto 2px; width: 100%;">
                <span class="exp-kpi-badge" id="expectedCountUpcoming" style="font-size: 0.62rem; background: rgba(245, 158, 11, 0.25); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); padding: 2px 8px; border-radius: 6px; font-weight: 800; text-align: center;">0 بند</span>
              </div>
              <div class="exp-kpi-val" id="expectedTotalUpcoming" style="font-size: clamp(0.86rem, 2.6vw, 1.05rem); font-weight: 950; color: #fbbf24; line-height: 1.2; font-variant-numeric: tabular-nums; text-align: center; margin: 2px auto 0; direction: rtl;">0.00 ج.م</div>
            </div>

            <!-- 2. ديون علينا للغير -->
            <div class="exp-kpi-card exp-card-rose" id="cardExpDebtsOnUs" onclick="toggleExpectedFilter('debt_on_us')" title="انقر لتصفية الديون المستحقة علينا" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 10px 8px; border-radius: 13px;">
              <div class="exp-card-header" style="display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%;">
                <span style="font-size: 0.86rem; color: #f43f5e;"><i class="fa-solid fa-hand-holding-dollar"></i></span>
                <span class="exp-kpi-title" style="font-size: clamp(0.80rem, 2.3vw, 0.92rem); font-weight: 900; color: #fca5a5; white-space: nowrap;">ديون علينا</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: center; margin: 4px auto 2px; width: 100%;">
                <span class="exp-kpi-badge" id="expectedCountDebtsOnUs" style="font-size: 0.62rem; background: rgba(244, 63, 94, 0.25); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.4); padding: 2px 8px; border-radius: 6px; font-weight: 800; text-align: center;">0 بند</span>
              </div>
              <div class="exp-kpi-val" id="expectedTotalDebtsOnUs" style="font-size: clamp(0.86rem, 2.6vw, 1.05rem); font-weight: 950; color: #f43f5e; line-height: 1.2; font-variant-numeric: tabular-nums; text-align: center; margin: 2px auto 0; direction: rtl;">- 0.00 ج.م</div>
            </div>

            <!-- 3. ديون لنا عند الغير -->
            <div class="exp-kpi-card exp-card-emerald" id="cardExpDebtsForUs" onclick="toggleExpectedFilter('debt_for_us')" title="انقر لتصفية الديون المستحقة لنا" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 10px 8px; border-radius: 13px;">
              <div class="exp-card-header" style="display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%;">
                <span style="font-size: 0.86rem; color: #34d399;"><i class="fa-solid fa-sack-dollar"></i></span>
                <span class="exp-kpi-title" style="font-size: clamp(0.80rem, 2.3vw, 0.92rem); font-weight: 900; color: #86efac; white-space: nowrap;">ديون لنا</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: center; margin: 4px auto 2px; width: 100%;">
                <span class="exp-kpi-badge" id="expectedCountDebtsForUs" style="font-size: 0.62rem; background: rgba(16, 185, 129, 0.25); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 2px 8px; border-radius: 6px; font-weight: 800; text-align: center;">0 بند</span>
              </div>
              <div class="exp-kpi-val" id="expectedTotalDebtsForUs" style="font-size: clamp(0.86rem, 2.6vw, 1.05rem); font-weight: 950; color: #34d399; line-height: 1.2; font-variant-numeric: tabular-nums; text-align: center; margin: 2px auto 0; direction: rtl;">+ 0.00 ج.م</div>
            </div>

            <!-- 4. تم سداده / تحصيله -->
            <div class="exp-kpi-card exp-card-cyan" id="cardExpPaid" onclick="toggleExpectedFilter('paid')" title="انقر لتصفية الحركات المنتهية والمسددة" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 10px 8px; border-radius: 13px;">
              <div class="exp-card-header" style="display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%;">
                <span style="font-size: 0.86rem; color: #38bdf8;"><i class="fa-solid fa-circle-check"></i></span>
                <span class="exp-kpi-title" style="font-size: clamp(0.80rem, 2.3vw, 0.92rem); font-weight: 900; color: #7dd3fc; white-space: nowrap;">تم السداد</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: center; margin: 4px auto 2px; width: 100%;">
                <span class="exp-kpi-badge" id="expectedCountPaid" style="font-size: 0.62rem; background: rgba(56, 189, 248, 0.25); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); padding: 2px 8px; border-radius: 6px; font-weight: 800; text-align: center;">0 مكتمل</span>
              </div>
              <div class="exp-kpi-val" id="expectedTotalPaid" style="font-size: clamp(0.86rem, 2.6vw, 1.05rem); font-weight: 950; color: #38bdf8; line-height: 1.2; font-variant-numeric: tabular-nums; text-align: center; margin: 2px auto 0; direction: rtl;">0.00 ج.م</div>
            </div>
          </div>

          <!-- شريط صافي الالتزامات المستقبلية -->"""

    if old_commitments_cockpit.search(content):
        content = old_commitments_cockpit.sub(new_commitments_cockpit, content, count=1)
        print("✓ Updated commitments cards layout & centering")
    else:
        print("✗ Could not match commitments cards pattern")

    # =========================================================================
    # 4. إضافة إمكانية تصوير ورفع صورة الفاتورة في نافذة تعديل العملية (editTxModal)
    # =========================================================================
    old_edit_tx_modal = re.compile(
        r'<div class="modal-overlay modal-overlay-custom" id="editTxModal">.*?<!-- أزرار الحفظ والإلغاء -->',
        re.DOTALL
    )

    new_edit_tx_modal = """<div class="modal-overlay modal-overlay-custom" id="editTxModal">
      <div class="modal-content-card" style="max-width: 480px; max-height: 92vh; border-radius: 20px; padding: 14px 18px; display: flex; flex-direction: column;">
        <div class="modal-head" style="margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
          <h3 class="modal-title-custom" style="font-size: 0.95rem; color: #38bdf8; display: flex; align-items: center; gap: 8px; margin: 0;">
            <i class="fa-solid fa-pen-to-square"></i>
            <span>تفاصيل وتعديل العملية المالية</span>
          </h3>
          <button type="button" class="btn-modal-close" onclick="closeModal('editTxModal')" style="font-size: 1.3rem; line-height: 1; cursor: pointer; background: transparent; border: none; color: #94a3b8;">&times;</button>
        </div>
        <form id="formEditTx" onsubmit="event.preventDefault(); saveEditedTx();" style="display: flex; flex-direction: column; gap: 10px; overflow-y: auto;">
          <input type="hidden" id="editTxId">
          
          <!-- نوع العملية -->
          <div class="form-group-custom" style="margin-bottom: 0;">
            <label class="form-label-custom" style="font-size: 0.74rem; font-weight: 800; margin-bottom: 3px;">نوع العملية:</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <label style="background: rgba(244, 63, 94, 0.12); border: 1.5px solid rgba(244, 63, 94, 0.4); border-radius: 8px; padding: 6px; text-align: center; cursor: pointer; font-size: 0.78rem; font-weight: 800; color: #ff4d6d; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <input type="radio" name="editTxType" id="editTxTypeExpense" value="expense"> مصروف
              </label>
              <label style="background: rgba(16, 185, 129, 0.12); border: 1.5px solid rgba(16, 185, 129, 0.4); border-radius: 8px; padding: 6px; text-align: center; cursor: pointer; font-size: 0.78rem; font-weight: 800; color: #34d399; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <input type="radio" name="editTxType" id="editTxTypeIncome" value="income"> دخل / إيداع
              </label>
            </div>
          </div>

          <!-- المبلغ -->
          <div class="form-group-custom" style="margin-bottom: 0;">
            <label class="form-label-custom" style="font-size: 0.74rem; font-weight: 800; margin-bottom: 3px;">المبلغ (ج.م):</label>
            <input type="number" step="0.01" class="form-input-custom" id="editTxAmount" required style="font-size: 1.1rem; font-weight: 900; text-align: center; color: #38bdf8; height: 40px;">
          </div>

          <!-- البيان / الوصف -->
          <div class="form-group-custom" style="margin-bottom: 0;">
            <label class="form-label-custom" style="font-size: 0.74rem; font-weight: 800; margin-bottom: 3px;">البيان / الوصف:</label>
            <input type="text" class="form-input-custom" id="editTxLabel" required style="font-size: 0.85rem; height: 38px;">
          </div>

          <!-- التصنيف والمحفظة في صف واحد -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div class="form-group-custom" style="margin-bottom: 0;">
              <label class="form-label-custom" style="font-size: 0.74rem; font-weight: 800; margin-bottom: 3px;">التصنيف:</label>
              <select class="form-input-custom" id="editTxCategory" style="font-size: 0.80rem; height: 38px;"></select>
            </div>
            <div class="form-group-custom" style="margin-bottom: 0;">
              <label class="form-label-custom" style="font-size: 0.74rem; font-weight: 800; margin-bottom: 3px;">المحفظة:</label>
              <select class="form-input-custom" id="editTxWallet" style="font-size: 0.80rem; height: 38px;"></select>
            </div>
          </div>

          <!-- الشخص والتاريخ في صف واحد -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div class="form-group-custom" style="margin-bottom: 0;">
              <label class="form-label-custom" style="font-size: 0.74rem; font-weight: 800; margin-bottom: 3px;">يخص من في العائلة:</label>
              <select class="form-input-custom" id="editTxMember" style="font-size: 0.80rem; height: 38px;"></select>
            </div>
            <div class="form-group-custom" style="margin-bottom: 0;">
              <label class="form-label-custom" style="font-size: 0.74rem; font-weight: 800; margin-bottom: 3px;">التاريخ:</label>
              <input type="date" class="form-input-custom" id="editTxDate" required style="font-size: 0.80rem; height: 38px;">
            </div>
          </div>

          <!-- قسم تصوير ورفع صورة الفاتورة أو الإيصال في التعديل -->
          <div style="background: rgba(15, 23, 42, 0.75); border: 1.2px dashed rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 10px; margin-top: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label style="font-size: 0.74rem; font-weight: 800; color: #cbd5e1; display: flex; align-items: center; gap: 6px; margin: 0;">
                <i class="fa-solid fa-receipt" style="color: #38bdf8;"></i> صورة الفاتورة أو الإيصال:
              </label>
              <span id="editReceiptAttachedBadge" style="display: none; font-size: 0.64rem; background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 1px 7px; border-radius: 6px; font-weight: 800;">
                <i class="fa-solid fa-circle-check"></i> صورة مرفقة
              </span>
            </div>

            <input type="file" id="inpEditTxReceipt" accept="image/*" style="display:none;" onchange="handleEditReceiptUpload(event)">
            <input type="file" id="inpEditTxReceiptCamera" accept="image/*" capture="environment" style="display:none;" onchange="handleEditReceiptUpload(event)">

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <button type="button" onclick="document.getElementById('inpEditTxReceiptCamera').click()" style="height: 38px; font-size: 0.78rem; font-weight: 800; border-radius: 9px; background: rgba(56, 189, 248, 0.18); border: 1.2px solid #38bdf8; color: #38bdf8; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;">
                <i class="fa-solid fa-camera"></i> تصوير بالكاميرا 📷
              </button>
              <button type="button" onclick="document.getElementById('inpEditTxReceipt').click()" style="height: 38px; font-size: 0.78rem; font-weight: 800; border-radius: 9px; background: rgba(16, 185, 129, 0.18); border: 1.2px solid #10b981; color: #34d399; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;">
                <i class="fa-solid fa-images"></i> اختيار من المعرض 🖼️
              </button>
            </div>

            <!-- معاينة الصورة مع زر التكبير والحذف -->
            <div id="editReceiptPreviewContainer" style="display: none; margin-top: 8px; text-align: center; background: rgba(0,0,0,0.35); border-radius: 10px; padding: 8px;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap;">
                <img id="editReceiptPreviewImg" src="" onclick="openReceiptLightbox(this.src, 'فاتورة العملية')" style="max-height: 85px; max-width: 150px; border-radius: 8px; border: 1.5px solid rgba(56, 189, 248, 0.5); object-fit: cover; cursor: pointer;" title="انقر للتكبير">
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                  <span style="font-size: 0.68rem; color: #38bdf8; font-weight: 800;"><i class="fa-solid fa-magnifying-glass-plus"></i> انقر للتكبير</span>
                  <button type="button" onclick="clearEditReceiptUpload()" style="padding: 4px 10px; border-radius: 6px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.5); color: #f87171; font-size: 0.70rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    <i class="fa-solid fa-trash-can"></i> إزالة الصورة المرفقة
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- أزرار الحفظ والإلغاء -->"""

    if old_edit_tx_modal.search(content):
        content = old_edit_tx_modal.sub(new_edit_tx_modal, content, count=1)
        print("✓ Injected receipt camera & upload into editTxModal")
    else:
        print("✗ Could not match editTxModal pattern")

    # =========================================================================
    # 5. أزرار إغلاق في نوافذ التسجيل (panelNewExpected, panelBillsExpected, etc.)
    # =========================================================================
    # إضافة زر إغلاق في panelNewExpected
    old_panel_new_exp_head = '''<div style="font-size: 0.88rem; font-weight: 900; color: #38bdf8; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-file-invoice-dollar"></i> <span>تسجيل التزام مالي أو دين جديد:</span>
            </div>'''
    new_panel_new_exp_head = '''<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid rgba(56, 189, 248, 0.25); padding-bottom: 6px;">
              <div style="font-size: 0.88rem; font-weight: 900; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-file-invoice-dollar"></i> <span>تسجيل التزام مالي أو دين جديد:</span>
              </div>
              <button type="button" onclick="switchExpectedTab('list')" title="إغلاق والعودة للقائمة" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); border-radius: 50%; width: 28px; height: 28px; line-height: 26px; text-align: center; color: #cbd5e1; font-size: 1.1rem; cursor: pointer;">&times;</button>
            </div>'''
    content = content.replace(old_panel_new_exp_head, new_panel_new_exp_head, 1)

    # زر إلغاء إضافي أسفل نموذج الالتزام
    old_submit_exp_btn = '''<!-- زر حفظ الالتزام -->
            <button type="button" class="btn-submit-tx" onclick="submitExpectedExpense()" style="background: linear-gradient(135deg, #10b981, #059669); border: none; height: 42px; border-radius: 10px; color: #fff; font-weight: 900; font-size: 0.88rem; width: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">
              <i class="fa-solid fa-check-circle"></i> تثبيت وحفظ الالتزام المالي
            </button>'''
    new_submit_exp_btn = '''<!-- زرا حفظ الالتزام والإلغاء -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px; margin-top: 6px;">
              <button type="button" class="btn-submit-tx" onclick="submitExpectedExpense()" style="background: linear-gradient(135deg, #10b981, #059669); border: none; height: 42px; border-radius: 10px; color: #fff; font-weight: 900; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">
                <i class="fa-solid fa-check-circle"></i> تثبيت وحفظ الالتزام
              </button>
              <button type="button" onclick="switchExpectedTab('list')" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); height: 42px; border-radius: 10px; color: #94a3b8; font-weight: 800; font-size: 0.82rem; cursor: pointer;">
                إلغاء / إغلاق
              </button>
            </div>'''
    content = content.replace(old_submit_exp_btn, new_submit_exp_btn, 1)

    # زر إغلاق في ترويسة panelBillsExpected
    old_panel_bills_head = '''<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="font-size: 0.88rem; font-weight: 900; color: #fbbf24; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-file-invoice"></i> <span>تسجيل ومتابعة الفواتير المصورة:</span>
              </div>
              <span id="billsCountSummaryBadge" style="font-size: 0.65rem; background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 2px 8px; border-radius: 6px; font-weight: 800;">0 فاتورة مسجلة</span>
            </div>'''
    new_panel_bills_head = '''<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid rgba(245, 158, 11, 0.25); padding-bottom: 6px;">
              <div style="font-size: 0.88rem; font-weight: 900; color: #fbbf24; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-file-invoice"></i> <span>تسجيل ومتابعة الفواتير المصورة:</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span id="billsCountSummaryBadge" style="font-size: 0.65rem; background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 2px 8px; border-radius: 6px; font-weight: 800;">0 فاتورة مسجلة</span>
                <button type="button" onclick="toggleBillsExpectedPanel()" title="إغلاق لوحة الفواتير" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); border-radius: 50%; width: 26px; height: 26px; line-height: 24px; text-align: center; color: #cbd5e1; font-size: 1.1rem; cursor: pointer;">&times;</button>
              </div>
            </div>'''
    content = content.replace(old_panel_bills_head, new_panel_bills_head, 1)

    # =========================================================================
    # 6. تحديث دوال معالجة صورة الفاتورة في التعديل: handleEditReceiptUpload & updateEditTxReceiptPreview
    # =========================================================================
    edit_receipt_js = """
    let currentEditTxReceiptDataUri = null;

    function handleEditReceiptUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          const maxDim = 1200;
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
            else { w = Math.round((w * maxDim) / h); h = maxDim; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          currentEditTxReceiptDataUri = canvas.toDataURL('image/jpeg', 0.82);
          updateEditTxReceiptPreview();
          showToast('📸 تم تحميل صورة الفاتورة للعملية بنجاح');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function updateEditTxReceiptPreview() {
      const container = document.getElementById('editReceiptPreviewContainer');
      const img = document.getElementById('editReceiptPreviewImg');
      const badge = document.getElementById('editReceiptAttachedBadge');
      if (currentEditTxReceiptDataUri) {
        if (img) img.src = currentEditTxReceiptDataUri;
        if (container) container.style.display = 'block';
        if (badge) badge.style.display = 'inline-block';
      } else {
        if (img) img.src = '';
        if (container) container.style.display = 'none';
        if (badge) badge.style.display = 'none';
      }
    }

    function clearEditReceiptUpload() {
      currentEditTxReceiptDataUri = null;
      const inp1 = document.getElementById('inpEditTxReceipt');
      const inp2 = document.getElementById('inpEditTxReceiptCamera');
      if (inp1) inp1.value = '';
      if (inp2) inp2.value = '';
      updateEditTxReceiptPreview();
      showToast('🗑️ تمت إزالة صورة الفاتورة');
    }
    """

    # حقن دوال معالجة صورة التعديل قبل openEditTxModal
    content = content.replace("function openEditTxModal(txId) {", edit_receipt_js + "\n    function openEditTxModal(txId) {", 1)

    # التأكد من استدعاء updateEditTxReceiptPreview() في openEditTxModal
    content = content.replace(
        "currentEditTxReceiptDataUri = tx.receipt || null;",
        "currentEditTxReceiptDataUri = tx.receipt || null;\n      updateEditTxReceiptPreview();"
    )

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Successfully applied Updates Phase 1!")

if __name__ == '__main__':
    apply_updates()

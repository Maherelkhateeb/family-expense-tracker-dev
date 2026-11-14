import sys
import re

INDEX_PATH = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

print("Reading index.html...")
with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the tabs strip in subViewCommitments to have 3 buttons: [ إضافة التزام ] [ فواتير ] [ قائمة الالتزامات ]
old_tabs_strip = '''          <!-- شريط التبديل: سداد/إضافة التزام على اليمين وقائمة الالتزامات على اليسار -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <!-- 1. سداد / إضافة التزام مالي (ناحية اليمين) -->
            <button type="button" id="btnTabNewExpected" onclick="switchExpectedTab('new')" class="exp-tab-btn" style="padding: 9px 10px; border-radius: 10px; font-weight: 900; font-size: 0.82rem; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; border: none; background: rgba(255,255,255,0.06); color: #94a3b8; border: 1px solid rgba(255,255,255,0.08);">
              <i class="fa-solid fa-hand-holding-dollar" style="color: #38bdf8;"></i> <span>سداد / إضافة التزام</span>
            </button>

            <!-- 2. قائمة الالتزامات (ناحية اليسار) -->
            <button type="button" id="btnTabListExpected" onclick="switchExpectedTab('list')" class="exp-tab-btn active" style="padding: 9px 10px; border-radius: 10px; font-weight: 900; font-size: 0.82rem; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; border: none; background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);">
              <i class="fa-solid fa-table-list"></i> <span>قائمة الالتزامات</span>
              <span class="badge-req-counter" id="expectedPendingBadgeTab" style="background: rgba(255, 255, 255, 0.25); color: #fff; padding: 1px 7px; border-radius: 8px; font-size: 0.70rem;">0</span>
            </button>
          </div>'''

new_tabs_strip = '''          <!-- شريط التبديل الثلاثي: إضافة التزام / فواتير مصورة / قائمة الالتزامات -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1.1fr; gap: 6px; margin-bottom: 12px;">
            <!-- 1. سداد / إضافة التزام مالي -->
            <button type="button" id="btnTabNewExpected" onclick="switchExpectedTab('new')" class="exp-tab-btn" style="padding: 9px 6px; border-radius: 10px; font-weight: 900; font-size: 0.76rem; display: flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.06); color: #94a3b8; transition: all 0.2s ease;">
              <i class="fa-solid fa-hand-holding-dollar" style="color: #38bdf8;"></i> <span>إضافة التزام</span>
            </button>

            <!-- 2. زر فواتير الجديد المخصص لتسجيل الفواتير بالتواريخ وربطها بمصروف وشخص والصور -->
            <button type="button" id="btnTabBillsExpected" onclick="switchExpectedTab('bills')" class="exp-tab-btn" style="padding: 9px 6px; border-radius: 10px; font-weight: 900; font-size: 0.76rem; display: flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer; border: 1.2px solid rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.14); color: #fbbf24; transition: all 0.2s ease;">
              <i class="fa-solid fa-file-invoice"></i> <span>فواتير</span>
              <span class="badge-req-counter" id="billsCountBadgeTab" style="background: rgba(245, 158, 11, 0.35); color: #fbbf24; padding: 1px 6px; border-radius: 8px; font-size: 0.65rem; font-weight: 900;">0</span>
            </button>

            <!-- 3. قائمة الالتزامات -->
            <button type="button" id="btnTabListExpected" onclick="switchExpectedTab('list')" class="exp-tab-btn active" style="padding: 9px 6px; border-radius: 10px; font-weight: 900; font-size: 0.76rem; display: flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer; border: none; background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35); transition: all 0.2s ease;">
              <i class="fa-solid fa-table-list"></i> <span>قائمة الالتزامات</span>
              <span class="badge-req-counter" id="expectedPendingBadgeTab" style="background: rgba(255, 255, 255, 0.25); color: #fff; padding: 1px 7px; border-radius: 8px; font-size: 0.70rem;">0</span>
            </button>
          </div>'''

if old_tabs_strip in content:
    content = content.replace(old_tabs_strip, new_tabs_strip, 1)
    print("[OK] Step 1: Added prominent 'فواتير' tab button into commitments strip.")
else:
    print("! Warning: old_tabs_strip not found.")

# 2. Also add a direct 'فواتير' shortcut in expected top hero next to 'الملاحظات'
old_hero_btn = '''            <button type="button" onclick="openNotesModal()" class="btn-wallet-action-pill" style="height: 32px; font-size: 0.72rem; padding: 0 10px; background: linear-gradient(135deg, #d97706, #b45309); border: none; color: #fff; font-weight: 800; border-radius: 9px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.35); flex-shrink: 0;">
              <i class="fa-solid fa-book-open"></i> <span>الملاحظات</span>
            </button>'''

new_hero_btn = '''            <div style="display: flex; gap: 6px;">
              <button type="button" onclick="switchExpectedTab('bills')" class="btn-wallet-action-pill" style="height: 32px; font-size: 0.72rem; padding: 0 10px; background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: #fff; font-weight: 900; border-radius: 9px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35); flex-shrink: 0;">
                <i class="fa-solid fa-file-invoice"></i> <span>فواتير</span>
              </button>
              <button type="button" onclick="openNotesModal()" class="btn-wallet-action-pill" style="height: 32px; font-size: 0.72rem; padding: 0 10px; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; color: #fff; font-weight: 800; border-radius: 9px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35); flex-shrink: 0;">
                <i class="fa-solid fa-book-open"></i> <span>الملاحظات</span>
              </button>
            </div>'''

if old_hero_btn in content:
    content = content.replace(old_hero_btn, new_hero_btn, 1)
    print("[OK] Step 2: Added 'فواتير' shortcut button in top hero header.")
else:
    print("! Warning: old_hero_btn not found.")

# 3. Upgrade panelBillsExpected HTML form for high professionalism
old_panel_bills = '''          <!-- قسم الفواتير والمستندات المصورة (panelBillsExpected) -->
          <div id="panelBillsExpected" class="app-card-panel" style="display: none; background: rgba(30, 41, 59, 0.85); border: 1.2px solid rgba(245, 158, 11, 0.45); border-radius: 14px; padding: 14px; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid rgba(245, 158, 11, 0.25); padding-bottom: 6px;">
              <div style="font-size: 0.88rem; font-weight: 900; color: #fbbf24; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-file-invoice"></i> <span>تسجيل ومتابعة الفواتير المصورة:</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span id="billsCountSummaryBadge" style="font-size: 0.65rem; background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 2px 8px; border-radius: 6px; font-weight: 800;">0 فاتورة مسجلة</span>
                <button type="button" onclick="toggleBillsExpectedPanel()" title="إغلاق لوحة الفواتير" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); border-radius: 50%; width: 26px; height: 26px; line-height: 24px; text-align: center; color: #cbd5e1; font-size: 1.1rem; cursor: pointer;">&times;</button>
              </div>
            </div>

            <!-- نموذج إضافة فاتورة جديدة -->
            <form onsubmit="event.preventDefault(); saveNewBill();" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; background: rgba(15, 23, 42, 0.6); padding: 10px; border-radius: 10px; border: 1px dashed rgba(245, 158, 11, 0.3);">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div>
                  <label style="font-size: 0.68rem; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 2px;">بيان الفاتورة <span class="req">*</span></label>
                  <input type="text" id="inpBillName" class="form-input-custom" placeholder="مثال: كهرباء، غاز، إنترنت..." required style="height: 36px; font-size: 0.78rem;">
                </div>
                <div>
                  <label style="font-size: 0.68rem; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 2px;">المبلغ (ج.م) <span class="req">*</span></label>
                  <input type="number" step="0.01" id="inpBillAmount" class="form-input-custom" placeholder="0.00" required style="height: 36px; font-size: 0.90rem; font-weight: 900; color: #38bdf8;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
                <div>
                  <label style="font-size: 0.68rem; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 2px;">تاريخ الاستحقاق</label>
                  <input type="date" id="inpBillDueDate" class="form-input-custom" style="height: 36px; font-size: 0.72rem;">
                </div>
                <div>
                  <label style="font-size: 0.68rem; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 2px;">تخص من</label>
                  <select id="inpBillMember" class="form-select-custom" style="height: 36px; font-size: 0.75rem;">
                    <option value="البيت">البيت</option>
                    <option value="ماهر">ماهر</option>
                    <option value="أية">أية</option>
                    <option value="محمد">محمد</option>
                    <option value="مريم">مريم</option>
                    <option value="الحاجة">الحاجة</option>
                    <option value="النونو">النونو</option>
                  </select>
                </div>
                <div>
                  <label style="font-size: 0.68rem; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 2px;">البند المرتبط</label>
                  <select id="inpBillCategory" class="form-select-custom" style="height: 36px; font-size: 0.75rem;">
                    <option value="bills">فواتير والتزامات</option>
                    <option value="house">مستلزمات منزل</option>
                    <option value="education">تعليم ودروس</option>
                    <option value="health">صحة وعلاج</option>
                    <option value="other">أخرى ونثريات</option>
                  </select>
                </div>
              </div>

              <!-- التقاط أو رفع صورة الفاتورة -->
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; background: rgba(30, 41, 59, 0.6); padding: 6px 10px; border-radius: 8px;">
                <input type="file" id="inpBillPhotoFile" accept="image/*" style="display: none;" onchange="handleBillPhotoSelected(event)">
                <div style="display: flex; gap: 6px;">
                  <button type="button" onclick="document.getElementById('inpBillPhotoFile').setAttribute('capture','environment'); document.getElementById('inpBillPhotoFile').click();" style="background: rgba(56, 189, 248, 0.2); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; border-radius: 6px; padding: 4px 10px; font-size: 0.70rem; font-weight: 800; cursor: pointer;">
                    <i class="fa-solid fa-camera"></i> تصوير
                  </button>
                  <button type="button" onclick="document.getElementById('inpBillPhotoFile').removeAttribute('capture'); document.getElementById('inpBillPhotoFile').click();" style="background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; border-radius: 6px; padding: 4px 10px; font-size: 0.70rem; font-weight: 800; cursor: pointer;">
                    <i class="fa-solid fa-image"></i> معرض
                  </button>
                </div>
                <div id="billPhotoPreviewBadge" style="font-size: 0.64rem; color: #94a3b8;">لم يتم التقاط صورة</div>
              </div>

              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px; margin-top: 6px;">
                <button type="submit" class="btn-submit-tx" style="height: 38px; background: linear-gradient(135deg, #f59e0b, #d97706); border: none; border-radius: 8px; font-weight: 900; font-size: 0.80rem; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  <i class="fa-solid fa-floppy-disk"></i> حفظ الفاتورة
                </button>
                <button type="button" onclick="toggleBillsExpectedPanel()" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); height: 38px; border-radius: 8px; color: #94a3b8; font-weight: 800; font-size: 0.80rem; cursor: pointer;">
                  إلغاء / إغلاق
                </button>
              </div><!-- replaced single submit -->
            </form>

            <!-- جدول الفواتير المسجلة -->
            <div id="billsListContainer" style="display: flex; flex-direction: column; gap: 8px;"></div>
          </div>'''

new_panel_bills = '''          <!-- قسم الفواتير والمستندات المصورة (panelBillsExpected) المعاد بناؤه باحترافية كاملة -->
          <div id="panelBillsExpected" class="app-card-panel" style="display: none; background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95)); border: 1.5px solid rgba(245, 158, 11, 0.5); border-radius: 16px; padding: 16px; margin-bottom: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1.2px solid rgba(245, 158, 11, 0.3); padding-bottom: 8px;">
              <div style="font-size: 0.92rem; font-weight: 900; color: #fbbf24; display: flex; align-items: center; gap: 8px;">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4); display: flex; align-items: center; justify-content: center; color: #fbbf24;">
                  <i class="fa-solid fa-file-invoice"></i>
                </div>
                <span>تسجيل ومتابعة الفواتير المصورة:</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span id="billsCountSummaryBadge" style="font-size: 0.68rem; background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 3px 10px; border-radius: 8px; font-weight: 800; border: 1px solid rgba(245, 158, 11, 0.35);">0 فاتورة مسجلة</span>
                <button type="button" onclick="switchExpectedTab('list')" title="العودة للقائمة" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); border-radius: 50%; width: 28px; height: 28px; line-height: 26px; text-align: center; color: #cbd5e1; font-size: 1.1rem; cursor: pointer;">&times;</button>
              </div>
            </div>

            <!-- نموذج إضافة فاتورة جديدة متكامل مع المصروف والشخص والتاريخ والصورة/الكاميرا -->
            <form onsubmit="event.preventDefault(); saveNewBill();" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; background: rgba(15, 23, 42, 0.7); padding: 14px; border-radius: 12px; border: 1.2px solid rgba(245, 158, 11, 0.35);">
              
              <!-- 1. بيان الفاتورة والمبلغ -->
              <div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 10px;">
                <div>
                  <label style="font-size: 0.72rem; font-weight: 800; color: #cbd5e1; display: block; margin-bottom: 3px;">
                    <i class="fa-solid fa-tag" style="color: #fbbf24;"></i> بيان / اسم الفاتورة <span class="req" style="color: #f43f5e;">*</span>
                  </label>
                  <input type="text" id="inpBillName" class="form-input-custom" placeholder="مثال: فاتورة كهرباء، غاز، إنترنت..." required style="height: 38px; font-size: 0.82rem; font-weight: 800;">
                </div>
                <div>
                  <label style="font-size: 0.72rem; font-weight: 800; color: #cbd5e1; display: block; margin-bottom: 3px;">
                    <i class="fa-solid fa-coins" style="color: #38bdf8;"></i> المبلغ (ج.م) <span class="req" style="color: #f43f5e;">*</span>
                  </label>
                  <input type="number" step="0.01" id="inpBillAmount" class="form-input-custom" placeholder="0.00" required style="height: 38px; font-size: 0.98rem; font-weight: 900; color: #38bdf8; text-align: center;">
                </div>
              </div>

              <!-- 2. تاريخ الفاتورة / الاستحقاق، والشخص، والمصروف المرتبط -->
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                <div>
                  <label style="font-size: 0.70rem; font-weight: 800; color: #cbd5e1; display: block; margin-bottom: 3px;">
                    <i class="fa-regular fa-calendar" style="color: #38bdf8;"></i> تاريخ الفاتورة:
                  </label>
                  <input type="date" id="inpBillDueDate" class="form-input-custom" style="height: 38px; font-size: 0.78rem; font-weight: 800;">
                </div>
                <div>
                  <label style="font-size: 0.70rem; font-weight: 800; color: #cbd5e1; display: block; margin-bottom: 3px;">
                    <i class="fa-solid fa-user-check" style="color: #a855f7;"></i> تخص من بالعائلة:
                  </label>
                  <select id="inpBillMember" class="form-select-custom" style="height: 38px; font-size: 0.78rem; font-weight: 800; width: 100%;">
                    <option value="البيت">🏠 البيت / العائلة</option>
                    <option value="ماهر">ماهر</option>
                    <option value="أية">أية</option>
                    <option value="محمد">محمد</option>
                    <option value="مريم">مريم</option>
                    <option value="الحاجة">الحاجة</option>
                    <option value="النونو">النونو</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
                <div>
                  <label style="font-size: 0.70rem; font-weight: 800; color: #cbd5e1; display: block; margin-bottom: 3px;">
                    <i class="fa-solid fa-tags" style="color: #10b981;"></i> ربط بمصروف معين:
                  </label>
                  <select id="inpBillCategory" class="form-select-custom" style="height: 38px; font-size: 0.78rem; font-weight: 800; width: 100%;">
                    <option value="bills">⚡ فواتير والتزامات</option>
                    <option value="house">🛋️ مستلزمات منزل</option>
                    <option value="food">🛒 طعام ومشتريات</option>
                    <option value="daily">☕ مصروف يومي</option>
                    <option value="education">🎓 تعليم ودروس</option>
                    <option value="health">💊 صحة وعلاج</option>
                    <option value="transport">🚗 مواصلات وبنزين</option>
                    <option value="clothes">👔 ملابس وأحذية</option>
                    <option value="other">🎁 أخرى ونثريات</option>
                  </select>
                </div>
              </div>

              <!-- 3. تصوير بالكاميرا أو رفع صورة الفاتورة -->
              <div style="background: rgba(30, 41, 59, 0.8); border: 1.2px dashed rgba(245, 158, 11, 0.45); border-radius: 10px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
                <input type="file" id="inpBillPhotoFile" accept="image/*" style="display: none;" onchange="handleBillPhotoSelected(event)">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <button type="button" onclick="document.getElementById('inpBillPhotoFile').setAttribute('capture','environment'); document.getElementById('inpBillPhotoFile').click();" style="background: linear-gradient(135deg, #0284c7, #0369a1); border: none; color: #fff; border-radius: 8px; padding: 6px 14px; font-size: 0.76rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.35);">
                    <i class="fa-solid fa-camera"></i> <span>تصوير بالكاميرا</span>
                  </button>
                  <button type="button" onclick="document.getElementById('inpBillPhotoFile').removeAttribute('capture'); document.getElementById('inpBillPhotoFile').click();" style="background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; border-radius: 8px; padding: 6px 14px; font-size: 0.76rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-image"></i> <span>رفع من المعرض</span>
                  </button>
                </div>
                <div id="billPhotoPreviewBadge" style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: #94a3b8; font-weight: 700;">
                  <span>لم يتم التقاط صورة</span>
                </div>
              </div>

              <!-- معاينة الصورة المصغرة إن وجدت -->
              <div id="billPhotoThumbRow" style="display: none; align-items: center; gap: 8px; background: rgba(15, 23, 42, 0.9); padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3);">
                <img id="billPhotoThumbImg" src="" style="width: 36px; height: 36px; border-radius: 6px; object-fit: cover; border: 1px solid #38bdf8; cursor: pointer;" onclick="if(currentBillPhotoDataUri) openReceiptLightbox(currentBillPhotoDataUri, 'معاينة الفاتورة')">
                <span style="font-size: 0.70rem; color: #34d399; font-weight: 800; flex: 1;">تم تجهيز الصورة بنجاح (انقر للمعاينة)</span>
                <button type="button" onclick="clearCurrentBillPhoto()" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; border-radius: 6px; padding: 2px 8px; font-size: 0.65rem; cursor: pointer;">إزالة</button>
              </div>

              <!-- أزرار الحفظ والإلغاء -->
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-top: 4px;">
                <button type="submit" class="btn-submit-tx" style="height: 42px; background: linear-gradient(135deg, #f59e0b, #d97706); border: none; border-radius: 10px; font-weight: 900; font-size: 0.86rem; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);">
                  <i class="fa-solid fa-floppy-disk"></i> <span>حفظ وتثبيت الفاتورة</span>
                </button>
                <button type="button" onclick="switchExpectedTab('list')" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); height: 42px; border-radius: 10px; color: #94a3b8; font-weight: 800; font-size: 0.82rem; cursor: pointer;">
                  إلغاء / رجوع
                </button>
              </div>
            </form>

            <!-- جدول الفواتير المسجلة -->
            <div style="font-size: 0.82rem; font-weight: 900; color: #f8fafc; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-list-check" style="color: #fbbf24;"></i>
              <span>قائمة الفواتير المسجلة:</span>
            </div>
            <div id="billsListContainer" style="display: flex; flex-direction: column; gap: 8px;"></div>
          </div>'''

if old_panel_bills in content:
    content = content.replace(old_panel_bills, new_panel_bills, 1)
    print("[OK] Step 3: Upgraded panelBillsExpected form markup with camera, date, category, and member.")
else:
    print("! Warning: old_panel_bills not found, trying regex...")
    pattern_panel = r'<!-- قسم الفواتير والمستندات المصورة \(panelBillsExpected\) -->\s*<div id="panelBillsExpected"[\s\S]*?<!-- جدول الفواتير المسجلة -->\s*<div id="billsListContainer"[^>]*></div>\s*</div>'
    if re.search(pattern_panel, content):
        content = re.sub(pattern_panel, new_panel_bills, content, count=1)
        print("[OK] Step 3 applied via regex.")

# 4. Update switchExpectedTab(tab) to support 'bills'
old_switch_fn = '''    function switchExpectedTab(tab) {
      const pNew = document.getElementById('panelNewExpected');
      const pList = document.getElementById('panelListExpected');
      const bNew = document.getElementById('btnTabNewExpected');
      const bList = document.getElementById('btnTabListExpected');

      if (tab === 'new') {
        if (pNew) pNew.style.display = 'block';
        if (pList) pList.style.display = 'none';
        if (bNew) {
          bNew.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
          bNew.style.color = '#fff';
          bNew.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.35)';
        }
        if (bList) {
          bList.style.background = 'transparent';
          bList.style.color = '#94a3b8';
          bList.style.boxShadow = 'none';
        }
        if (typeof renderMemberPhotoPickers === 'function') {
          renderMemberPhotoPickers();
        }
      } else {
        if (pNew) pNew.style.display = 'none';
        if (pList) pList.style.display = 'block';
        if (bList) {
          bList.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
          bList.style.color = '#fff';
          bList.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.35)';
        }
        if (bNew) {
          bNew.style.background = 'transparent';
          bNew.style.color = '#94a3b8';
          bNew.style.boxShadow = 'none';
        }
        renderExpectedList();
      }
    }'''

new_switch_fn = '''    function switchExpectedTab(tab) {
      const pNew = document.getElementById('panelNewExpected');
      const pBills = document.getElementById('panelBillsExpected');
      const pList = document.getElementById('panelListExpected');
      const bNew = document.getElementById('btnTabNewExpected');
      const bBills = document.getElementById('btnTabBillsExpected');
      const bList = document.getElementById('btnTabListExpected');

      [bNew, bBills, bList].forEach(b => {
        if (b) {
          b.style.background = 'rgba(255,255,255,0.06)';
          b.style.color = '#94a3b8';
          b.style.boxShadow = 'none';
          b.style.border = '1px solid rgba(255,255,255,0.08)';
          b.classList.remove('active');
        }
      });

      if (tab === 'new') {
        if (pNew) pNew.style.display = 'block';
        if (pBills) pBills.style.display = 'none';
        if (pList) pList.style.display = 'none';
        if (bNew) {
          bNew.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
          bNew.style.color = '#fff';
          bNew.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.35)';
          bNew.classList.add('active');
        }
        if (typeof renderMemberPhotoPickers === 'function') {
          renderMemberPhotoPickers();
        }
      } else if (tab === 'bills') {
        if (pNew) pNew.style.display = 'none';
        if (pBills) pBills.style.display = 'block';
        if (pList) pList.style.display = 'none';
        if (bBills) {
          bBills.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
          bBills.style.color = '#fff';
          bBills.style.boxShadow = '0 4px 14px rgba(245, 158, 11, 0.4)';
          bBills.classList.add('active');
        }
        const dateInp = document.getElementById('inpBillDueDate');
        if (dateInp && !dateInp.value) {
          dateInp.value = typeof getLocalDateStr === 'function' ? getLocalDateStr(new Date()) : new Date().toISOString().split('T')[0];
        }
        renderBillsList();
      } else {
        if (pNew) pNew.style.display = 'none';
        if (pBills) pBills.style.display = 'none';
        if (pList) pList.style.display = 'block';
        if (bList) {
          bList.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
          bList.style.color = '#fff';
          bList.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.35)';
          bList.classList.add('active');
        }
        renderExpectedList();
      }
    }'''

if old_switch_fn in content:
    content = content.replace(old_switch_fn, new_switch_fn, 1)
    print("[OK] Step 4: switchExpectedTab updated to handle 'bills' tab.")
else:
    print("! Warning: old_switch_fn not found.")

# 5. Upgrade handleBillPhotoSelected, clearCurrentBillPhoto, and payBillAsExpense
old_photo_fn = '''    function handleBillPhotoSelected(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        currentBillPhotoDataUri = e.target.result;
        const badge = document.getElementById('billPhotoPreviewBadge');
        if (badge) {
          badge.textContent = 'تم التقاط الصورة ✓';
          badge.style.color = '#34d399';
        }
        showToast('📷 تم التقاط صورة الفاتورة بنجاح!');
      };
      reader.readAsDataURL(file);
    }'''

new_photo_fn = '''    function handleBillPhotoSelected(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        currentBillPhotoDataUri = e.target.result;
        const badge = document.getElementById('billPhotoPreviewBadge');
        if (badge) {
          badge.innerHTML = '<span style="color: #34d399;"><i class="fa-solid fa-circle-check"></i> تم التقاط الصورة بنجاح</span>';
        }
        const thumbRow = document.getElementById('billPhotoThumbRow');
        const thumbImg = document.getElementById('billPhotoThumbImg');
        if (thumbRow && thumbImg) {
          thumbImg.src = currentBillPhotoDataUri;
          thumbRow.style.display = 'flex';
        }
        showToast('📷 تم حفظ صورة الفاتورة بنجاح!');
      };
      reader.readAsDataURL(file);
    }

    function clearCurrentBillPhoto() {
      currentBillPhotoDataUri = null;
      const fileInp = document.getElementById('inpBillPhotoFile');
      if (fileInp) fileInp.value = '';
      const badge = document.getElementById('billPhotoPreviewBadge');
      if (badge) {
        badge.innerHTML = '<span>لم يتم التقاط صورة</span>';
      }
      const thumbRow = document.getElementById('billPhotoThumbRow');
      if (thumbRow) thumbRow.style.display = 'none';
      showToast('تمت إزالة صورة الفاتورة');
    }

    function payBillAsExpense(billId) {
      const bill = (state.expectedExpenses || []).find(b => b.id === billId);
      if (!bill) return;

      const catObj = (typeof getCategoryObj === 'function') ? getCategoryObj(bill.category || 'bills', 'expense') : null;
      const amt = Number(bill.amount) || 0;
      const defaultWallet = (state.wallets && state.wallets[0]) ? state.wallets[0].id : 'wallet-cash-safe';

      const tx = {
        id: 'tx-' + Date.now(),
        type: 'expense',
        label: bill.label || 'سداد فاتورة',
        amount: amt,
        category: bill.category || 'bills',
        member: bill.member || 'البيت',
        walletId: defaultWallet,
        date: typeof getLocalDateStr === 'function' ? getLocalDateStr(new Date()) : new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        receipt: bill.photo || null,
        note: `تم السداد تلقائياً من فاتورة مسجلة (${bill.label})`,
        author: state.currentUser || 'ماهر',
        createdAt: new Date().toISOString()
      };

      if (!state.transactions) state.transactions = [];
      state.transactions.unshift(tx);

      // تحديث حالة الفاتورة لتصبح مسددة
      bill.status = 'paid';
      bill.paidAt = new Date().toISOString();
      bill.paidTxId = tx.id;

      if (typeof saveState === 'function') saveState();

      if (typeof logActivity === 'function') {
        logActivity('expense', `سداد فاتورة: ${bill.label} بمبلغ ${amt} ج.م`, amt, bill.member);
      }

      renderUI();
      renderBillsList();
      renderExpectedList();
      showToast(`✅ تم سداد الفاتورة (${bill.label}) وتحويلها لمصروف مسجل بنجاح!`);
    }'''

if old_photo_fn in content:
    content = content.replace(old_photo_fn, new_photo_fn, 1)
    print("[OK] Step 5: Enhanced handleBillPhotoSelected, clearCurrentBillPhoto, and payBillAsExpense added.")
else:
    print("! Warning: old_photo_fn not found.")

# 6. Upgrade renderBillsList to show luxury cards with payment and lightbox
old_render_bills = '''      container.innerHTML = bills.map(b => {
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 8px 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-file-invoice" style="color: #fbbf24; font-size: 1.1rem;"></i>
              <div>
                <div style="font-size: 0.78rem; font-weight: 800; color: #f8fafc;">${escapeHtml(b.label)}</div>
                <div style="font-size: 0.64rem; color: #94a3b8;">تخص: ${b.member || 'البيت'} • الاستحقاق: ${b.dueDate || '──'}</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.85rem; font-weight: 900; color: #fbbf24; direction: ltr;">${formatMoney(b.amount)}</span>
              ${b.photo ? `<button type="button" onclick="openReceiptLightbox('${b.photo}', 'فاتورة: ${escapeHtml(b.label)}')" style="background: rgba(236, 72, 153, 0.2); border: 1px solid rgba(236, 72, 153, 0.4); color: #f472b6; border-radius: 6px; padding: 3px 6px; font-size: 0.65rem; cursor: pointer;"><i class="fa-solid fa-image"></i></button>` : ''}
              <button type="button" onclick="deleteExpectedItem('${b.id}')" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; border-radius: 6px; padding: 3px 6px; font-size: 0.65rem; cursor: pointer;"><i class="fa-solid fa-trash-can"></i></button>
            </div>
          </div>
        `;
      }).join('');'''

new_render_bills = '''      const badgeTab = document.getElementById('billsCountBadgeTab');
      if (badgeTab) badgeTab.textContent = bills.filter(b => b.status !== 'paid').length;

      container.innerHTML = bills.map(b => {
        const catObj = (typeof getCategoryObj === 'function') ? getCategoryObj(b.category || 'bills', 'expense') : { name: 'فواتير', icon: 'fa-file-invoice', color: '#fbbf24' };
        const isPaid = b.status === 'paid';
        const memberAvatar = MEMBER_AVATARS[b.member] || null;
        let avatarHtml = memberAvatar
          ? `<img src="${memberAvatar}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;">`
          : `<i class="fa-solid fa-user" style="font-size: 0.70rem; color: #38bdf8;"></i>`;

        return `
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(15, 23, 42, 0.85); border: 1.2px solid ${isPaid ? 'rgba(52, 211, 153, 0.3)' : 'rgba(245, 158, 11, 0.3)'}; border-radius: 12px; padding: 10px 14px; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, ${catObj.color || '#fbbf24'}, ${(catObj.color || '#fbbf24')}99); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.1rem; flex-shrink: 0;">
                <i class="fa-solid ${catObj.icon || 'fa-file-invoice'}"></i>
              </div>
              <div>
                <div style="font-size: 0.86rem; font-weight: 900; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
                  <span>${escapeHtml(b.label)}</span>
                  ${isPaid ? '<span style="font-size: 0.62rem; background: rgba(52, 211, 153, 0.2); color: #34d399; padding: 1px 6px; border-radius: 6px; font-weight: 800;">مسددة ✅</span>' : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px; font-size: 0.68rem; color: #94a3b8; flex-wrap: wrap;">
                  <span style="display: inline-flex; align-items: center; gap: 4px;">
                    ${avatarHtml}
                    <strong style="color: #cbd5e1;">${b.member || 'البيت'}</strong>
                  </span>
                  <span>•</span>
                  <span><i class="fa-regular fa-calendar" style="color: #38bdf8;"></i> ${b.dueDate || '──'}</span>
                  <span>•</span>
                  <span style="color: ${catObj.color || '#fbbf24'};"><i class="fa-solid fa-tag"></i> ${catObj.name}</span>
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${formatMoneyWithSignHtml(b.amount, '-', 'bill-amount-badge')}
              ${b.photo ? `
                <button type="button" onclick="openReceiptLightbox('${b.photo}', 'فاتورة: ${escapeHtml(b.label)}')" style="background: rgba(236, 72, 153, 0.2); border: 1.2px solid rgba(236, 72, 153, 0.4); color: #f472b6; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="معاينة صورة الفاتورة">
                  <i class="fa-solid fa-image" style="font-size: 0.85rem;"></i>
                </button>
              ` : ''}
              ${!isPaid ? `
                <button type="button" onclick="payBillAsExpense('${b.id}')" style="background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; border-radius: 8px; height: 32px; padding: 0 10px; font-size: 0.70rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);" title="سداد الفاتورة وتحويلها لمصروف">
                  <i class="fa-solid fa-check"></i> <span>سداد</span>
                </button>
              ` : ''}
              <button type="button" onclick="deleteExpectedItem('${b.id}')" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="حذف الفاتورة">
                <i class="fa-solid fa-trash-can" style="font-size: 0.78rem;"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');'''

if old_render_bills in content:
    content = content.replace(old_render_bills, new_render_bills, 1)
    print("[OK] Step 6: Upgraded renderBillsList with formatMoneyWithSignHtml, luxury badges, and instant pay button.")
else:
    print("! Warning: old_render_bills not found.")

print("Writing updated index.html...")
with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"[OK] index.html successfully updated ({len(content)} bytes).")

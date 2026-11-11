import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Locate subViewCommitments start and panelMonthlyBudget start
s_hero = html.find('<div class="expected-top-hero"')
s_sub = html.find('id="subViewCommitments"')
s_budget = html.find('id="panelMonthlyBudget"')

print(f"s_hero: {s_hero}, s_sub: {s_sub}, s_budget: {s_budget}")

# 1. New Top Hero & Segmented Tabs Strip
new_hero_and_tabs = '''<div class="expected-top-hero" style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.98)); border: 1.2px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 10px 14px; margin-bottom: 8px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: nowrap; gap: 8px;">
            <!-- العنوان والرمز -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(14, 165, 233, 0.1)); border: 1.2px solid rgba(56, 189, 248, 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #38bdf8;">
                <i class="fa-solid fa-scale-balanced"></i>
              </div>
              <div>
                <h2 style="font-size: 0.96rem; font-weight: 900; color: #f8fafc; margin: 0; display: flex; align-items: center; gap: 6px;">
                  <span>الالتزامات والديون والفواتير</span>
                </h2>
                <div style="font-size: 0.65rem; color: #94a3b8;">إدارة ذكية منفصلة للفواتير الدورية والديون المستحقة</div>
              </div>
            </div>
            <!-- أزرار الإجراءات السريعة -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <button type="button" onclick="toggleUnifiedAddCommitmentPanel()" class="btn-wallet-action-pill" id="btnToggleUnifiedAddCommitment" style="height: 32px; font-size: 0.74rem; padding: 0 11px; background: linear-gradient(135deg, #0284c7, #10b981); border: 1px solid rgba(56, 189, 248, 0.45); color: #fff; font-weight: 900; border-radius: 9px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 10px rgba(2, 132, 199, 0.35);">
                <i class="fa-solid fa-plus"></i> <span>إضافة جديدة</span>
              </button>
              <button type="button" onclick="openNotesModal()" class="btn-wallet-action-pill" style="height: 32px; width: 32px; padding: 0; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); color: #94a3b8; border-radius: 9px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;" title="ملاحظات">
                <i class="fa-solid fa-book-open"></i>
              </button>
            </div>
          </div>

          <!-- شريط التبويب الرئيسي: التفرقة الصريحة بين الفواتير والديون والميزانية -->
          <div class="expected-main-tabs-strip" id="commitmentsMasterTabStrip" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; background: rgba(15, 23, 42, 0.92); padding: 4px; border-radius: 11px; border: 1px solid rgba(255, 255, 255, 0.1);">
            <button type="button" id="tabCommitmentBills" onclick="switchCommitmentSubSection('bills')" class="exp-main-tab-btn active" style="padding: 7px 3px; border-radius: 8px; font-weight: 900; font-size: 0.72rem; color: #fff; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.35);">
              <i class="fa-solid fa-file-invoice"></i> <span>الفواتير</span>
              <span id="badgeCountBillsTab" style="background: rgba(255,255,255,0.25); font-size: 0.60rem; padding: 1px 5px; border-radius: 8px;">0</span>
            </button>
            <button type="button" id="tabCommitmentDebts" onclick="switchCommitmentSubSection('debts')" class="exp-main-tab-btn" style="padding: 7px 3px; border-radius: 8px; font-weight: 900; font-size: 0.72rem; color: #94a3b8; background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
              <i class="fa-solid fa-handshake"></i> <span>الديون</span>
              <span id="badgeCountDebtsTab" style="background: rgba(255,255,255,0.1); font-size: 0.60rem; padding: 1px 5px; border-radius: 8px;">0</span>
            </button>
            <button type="button" id="tabExpectedMonthlyBudget" onclick="switchExpectedMainTab('monthly_budget')" class="exp-main-tab-btn" style="padding: 7px 3px; border-radius: 8px; font-weight: 900; font-size: 0.72rem; color: #94a3b8; background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
              <i class="fa-solid fa-calculator"></i> <span>الميزانية</span>
            </button>
            <button type="button" id="tabExpectedBudgetHistory" onclick="switchExpectedMainTab('budget_history')" class="exp-main-tab-btn" style="padding: 7px 3px; border-radius: 8px; font-weight: 900; font-size: 0.72rem; color: #94a3b8; background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
              <i class="fa-solid fa-clock-rotate-left"></i> <span>الأرشيف</span>
            </button>
          </div>
        </div>
'''

# 2. Rebuilt subViewCommitments Content (KPIs + Unified Add Form + Separate Bills & Debts Views)
new_subViewCommitments = '''        <div id="subViewCommitments">
          
          <!-- بطاقة المؤشرات والمركز المالي الذكية (تتكيف تلقائياً بحسب التبويب: فواتير أو ديون) -->
          <div class="expected-kpi-master-card" id="commitmentKpiMasterCard" style="background: rgba(15, 23, 42, 0.88); border: 1.2px solid rgba(56, 189, 248, 0.25); border-radius: 14px; padding: 10px 12px; margin-bottom: 10px; box-shadow: 0 4px 18px rgba(0,0,0,0.4);">
            <!-- الشريط العلوي للصافي -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <div style="display: flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 900; color: #cbd5e1;">
                <i class="fa-solid fa-scale-balanced" id="kpiNetIconCommitments" style="color: #38bdf8;"></i>
                <span id="kpiNetLabelCommitments">إجمالي الفواتير القادمة المطلوب تدبيرها:</span>
              </div>
              <div id="kpiNetValueCommitments" style="font-size: 0.95rem; font-weight: 950; font-family: var(--font-numbers); direction: ltr; color: #ff4d6d;">
                - 0.00 ج.م
              </div>
            </div>

            <!-- الكبسولات الثلاثية المتناسقة -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;" id="kpiCapsulesCommitments">
              <!-- الكبسولة 1 -->
              <div style="background: rgba(30, 41, 59, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 7px 8px; text-align: center;">
                <div style="font-size: 0.66rem; color: #94a3b8; font-weight: 800;" id="kpiCap1Title">⚡ قادمة ومستحقة</div>
                <div style="font-size: 0.84rem; font-weight: 950; color: #fbbf24; margin-top: 2px; font-family: var(--font-numbers);" id="kpiCap1Amount">0.00</div>
                <div style="font-size: 0.60rem; color: #64748b;" id="kpiCap1Count">0 مسجلة</div>
              </div>
              <!-- الكبسولة 2 -->
              <div style="background: rgba(30, 41, 59, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 7px 8px; text-align: center;">
                <div style="font-size: 0.66rem; color: #94a3b8; font-weight: 800;" id="kpiCap2Title">✅ مسددة ومصروفة</div>
                <div style="font-size: 0.84rem; font-weight: 950; color: #34d399; margin-top: 2px; font-family: var(--font-numbers);" id="kpiCap2Amount">0.00</div>
                <div style="font-size: 0.60rem; color: #64748b;" id="kpiCap2Count">0 مسددة</div>
              </div>
              <!-- الكبسولة 3 -->
              <div style="background: rgba(30, 41, 59, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 7px 8px; text-align: center;">
                <div style="font-size: 0.66rem; color: #94a3b8; font-weight: 800;" id="kpiCap3Title">⚠️ متأخرة</div>
                <div style="font-size: 0.84rem; font-weight: 950; color: #f87171; margin-top: 2px; font-family: var(--font-numbers);" id="kpiCap3Amount">0.00</div>
                <div style="font-size: 0.60rem; color: #64748b;" id="kpiCap3Count">0 متأخرة</div>
              </div>
            </div>
          </div>

          <!-- ========================================================
               شاشة الإضافة المنسقة الموحدة الفاخرة (Unified Coordinated Add Form)
               ======================================================== -->
          <div id="panelUnifiedAddCommitment" class="app-card-panel" style="display: none; background: rgba(15, 23, 42, 0.95); border: 1.5px solid rgba(56, 189, 248, 0.45); border-radius: 16px; padding: 14px 16px; margin-bottom: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
            <!-- الرأس مع زر إغلاق صريح -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
              <div style="font-size: 0.92rem; font-weight: 900; color: #f8fafc; display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-plus-circle" style="color: #38bdf8;"></i>
                <span id="unifiedAddCommitmentTitle">تسجيل فاتورة أو دين جديد</span>
              </div>
              <button type="button" onclick="toggleUnifiedAddCommitmentPanel()" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); border-radius: 50%; width: 28px; height: 28px; line-height: 26px; text-align: center; color: #cbd5e1; font-size: 1.1rem; cursor: pointer;">&times;</button>
            </div>

            <!-- التفرقة الصريحة في أعلى شاشة الإضافة: 3 خيارات واضحة -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 12px;" id="unifiedAddTypeSwitcher">
              <button type="button" class="btn-export-tool active" id="btnTypeSelectBill" onclick="setUnifiedAddType('upcoming_bill')" style="padding: 7px 4px; font-size: 0.72rem; font-weight: 850; border-radius: 9px; justify-content: center; background: rgba(56, 189, 248, 0.22); color: #38bdf8; border: 1.2px solid rgba(56, 189, 248, 0.5);">
                <i class="fa-solid fa-file-invoice"></i> <span>فاتورة / قسط</span>
              </button>
              <button type="button" class="btn-export-tool" id="btnTypeSelectDebtOnUs" onclick="setUnifiedAddType('debt_on_us')" style="padding: 7px 4px; font-size: 0.72rem; font-weight: 850; border-radius: 9px; justify-content: center; background: transparent; color: #f87171; border: 1px solid rgba(248, 113, 113, 0.3);">
                <i class="fa-solid fa-arrow-down-long"></i> <span>دين علينا 🔴</span>
              </button>
              <button type="button" class="btn-export-tool" id="btnTypeSelectDebtForUs" onclick="setUnifiedAddType('debt_for_us')" style="padding: 7px 4px; font-size: 0.72rem; font-weight: 850; border-radius: 9px; justify-content: center; background: transparent; color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3);">
                <i class="fa-solid fa-arrow-up-long"></i> <span>دين لنا 🟢</span>
              </button>
            </div>

            <!-- النموذج المنسق المنظم بدقة تامة -->
            <form onsubmit="event.preventDefault(); submitUnifiedCommitment();" style="display: flex; flex-direction: column; gap: 10px;">
              
              <!-- الصف 1: البيان والمبلغ -->
              <div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 8px;">
                <div>
                  <label style="font-size: 0.72rem; font-weight: 800; color: #cbd5e1; display: block; margin-bottom: 3px;" id="lblUnifiedCommitmentTitle">
                    بيان / اسم الفاتورة <span class="req" style="color: #f43f5e;">*</span>
                  </label>
                  <input type="text" id="inpUnifiedCommitmentTitle" class="form-input-custom" placeholder="مثال: فاتورة كهرباء نوفمبر..." style="height: 38px; font-size: 0.84rem; font-weight: 800; width: 100%; border-radius: 9px; padding: 0 10px; box-sizing: border-box;">
                </div>
                <div>
                  <label style="font-size: 0.72rem; font-weight: 800; color: #cbd5e1; display: block; margin-bottom: 3px;">
                    المبلغ (ج.م) <span class="req" style="color: #f43f5e;">*</span>
                  </label>
                  <input type="number" step="0.01" id="inpUnifiedCommitmentAmount" class="form-input-custom" placeholder="0.00" style="height: 38px; font-size: 0.90rem; font-weight: 900; width: 100%; border-radius: 9px; padding: 0 10px; box-sizing: border-box; font-family: var(--font-numbers); direction: ltr;">
                </div>
              </div>

              <!-- الصف 2: تاريخ الاستحقاق وتخصيص الفرد -->
              <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 8px;">
                <div>
                  <label style="font-size: 0.72rem; font-weight: 800; color: #cbd5e1; display: block; margin-bottom: 3px;">
                    تاريخ الاستحقاق أو السداد <span class="req" style="color: #f43f5e;">*</span>
                  </label>
                  <input type="date" id="inpUnifiedCommitmentDueDate" class="form-input-custom" style="height: 38px; font-size: 0.82rem; font-weight: 800; width: 100%; border-radius: 9px; padding: 0 10px; box-sizing: border-box;">
                </div>
                <div>
                  <label style="font-size: 0.72rem; font-weight: 800; color: #cbd5e1; display: block; margin-bottom: 3px;">
                    تخص من بالعائلة:
                  </label>
                  <select id="inpUnifiedCommitmentMember" class="form-input-custom" style="height: 38px; font-size: 0.80rem; font-weight: 800; width: 100%; border-radius: 9px; padding: 0 6px; box-sizing: border-box;">
                    <option value="البيت">🏠 البيت / العائلة</option>
                    <option value="ماهر">👨 ماهر</option>
                    <option value="أية">👩 أية</option>
                    <option value="محمد">🧒 محمد</option>
                    <option value="مريم">👧 مريم</option>
                    <option value="الحاجة">🧕 الحاجة</option>
                    <option value="النونو">👶 النونو</option>
                    <option value="أخرى">📦 أخرى</option>
                  </select>
                </div>
              </div>

              <!-- الصف 3 (خاص بالفواتير): التصنيف وإرفاق الصورة الكاميرا -->
              <div id="rowUnifiedBillExtras" style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <div>
                    <label style="font-size: 0.72rem; font-weight: 800; color: #cbd5e1; display: block; margin-bottom: 3px;">
                      تصنيف ونوع الفاتورة:
                    </label>
                    <select id="inpUnifiedCommitmentCategory" class="form-input-custom" style="height: 38px; font-size: 0.80rem; font-weight: 800; width: 100%; border-radius: 9px; padding: 0 6px; box-sizing: border-box;">
                      <option value="bills">⚡ فواتير وكهرباء وغاز</option>
                      <option value="house">🛋️ إيجار ومستلزمات منزل</option>
                      <option value="education">🎓 تعليم ومصاريف دراسية</option>
                      <option value="transport">🚗 مواصلات وأقساط سيارة</option>
                      <option value="health">💊 اشتراكات علاج وتأمين</option>
                      <option value="other">📦 التزامات واشتراكات أخرى</option>
                    </select>
                  </div>
                  <!-- أزرار تصوير وإرفاق الفاتورة -->
                  <div>
                    <label style="font-size: 0.72rem; font-weight: 800; color: #cbd5e1; display: block; margin-bottom: 3px;">
                      إرفاق الفاتورة المصورة:
                    </label>
                    <div style="display: flex; gap: 4px;">
                      <input type="file" id="inpUnifiedBillPhotoCamera" accept="image/*" capture="environment" style="display: none;" onchange="handleUnifiedBillPhotoUpload(event)">
                      <input type="file" id="inpUnifiedBillPhotoGallery" accept="image/*" style="display: none;" onchange="handleUnifiedBillPhotoUpload(event)">
                      <button type="button" onclick="document.getElementById('inpUnifiedBillPhotoCamera').click()" style="flex: 1; height: 38px; border-radius: 8px; background: rgba(56, 189, 248, 0.18); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <i class="fa-solid fa-camera"></i> <span>كاميرا</span>
                      </button>
                      <button type="button" onclick="document.getElementById('inpUnifiedBillPhotoGallery').click()" style="flex: 1; height: 38px; border-radius: 8px; background: rgba(245, 158, 11, 0.18); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <i class="fa-solid fa-image"></i> <span>معرض</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- معاينة صورة الفاتورة إن وجدت -->
                <div id="unifiedBillPhotoPreviewRow" style="display: none; align-items: center; justify-content: space-between; background: rgba(15, 23, 42, 0.6); padding: 6px 10px; border-radius: 8px; border: 1px dashed rgba(56, 189, 248, 0.35);">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <img id="unifiedBillPhotoPreviewImg" src="" style="width: 32px; height: 32px; border-radius: 6px; object-fit: cover; border: 1px solid #38bdf8;">
                    <span style="font-size: 0.70rem; color: #34d399; font-weight: 800;">تم إرفاق صورة الفاتورة بنجاح ✓</span>
                  </div>
                  <button type="button" onclick="clearUnifiedBillPhoto()" style="background: rgba(244, 63, 94, 0.2); border: none; color: #f43f5e; border-radius: 6px; padding: 3px 8px; font-size: 0.70rem; cursor: pointer;">حذف الصورة</button>
                </div>
              </div>

              <!-- الصف 4 (خاص بالديون): ملاحظات وتفاصيل الدائن/المدين -->
              <div id="rowUnifiedDebtExtras" style="display: none;">
                <label style="font-size: 0.72rem; font-weight: 800; color: #cbd5e1; display: block; margin-bottom: 3px;">
                  ملاحظات وتفاصيل إضافية (أقساط السداد، سبب الدين...):
                </label>
                <input type="text" id="inpUnifiedDebtNotes" class="form-input-custom" placeholder="مثال: سداد على دفعتين، سلفة شخصية..." style="height: 38px; font-size: 0.82rem; width: 100%; border-radius: 9px; padding: 0 10px; box-sizing: border-box;">
              </div>

              <!-- أزرار الإجراء -->
              <div style="display: flex; gap: 8px; margin-top: 4px;">
                <button type="submit" style="flex: 1; height: 42px; border-radius: 10px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; font-weight: 900; font-size: 0.86rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">
                  <i class="fa-solid fa-floppy-disk"></i>
                  <span id="btnSubmitUnifiedCommitmentText">حفظ وتثبيت الالتزام</span>
                </button>
                <button type="button" onclick="toggleUnifiedAddCommitmentPanel()" style="height: 42px; padding: 0 14px; border-radius: 10px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #cbd5e1; font-weight: 800; font-size: 0.80rem; cursor: pointer;">
                  إلغاء
                </button>
              </div>

            </form>
          </div>

          <!-- ========================================================
               1. قسم عرض الفواتير والاشتراكات (Bills View)
               ======================================================== -->
          <div id="viewCommitmentsBillsList" style="display: block;">
            <!-- فلاتر الفواتير السريعة -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 8px; flex-wrap: wrap;">
              <div style="display: flex; gap: 4px;" id="billsFilterPills">
                <button type="button" class="btn-export-tool active" onclick="setBillsStatusFilter('all', this)" style="padding: 4px 9px; font-size: 0.70rem; border-radius: 7px; background: rgba(56, 189, 248, 0.22); color: #38bdf8;">الكل</button>
                <button type="button" class="btn-export-tool" onclick="setBillsStatusFilter('upcoming', this)" style="padding: 4px 9px; font-size: 0.70rem; border-radius: 7px; color: #fbbf24;">قادمة ومستحقة ⏳</button>
                <button type="button" class="btn-export-tool" onclick="setBillsStatusFilter('paid', this)" style="padding: 4px 9px; font-size: 0.70rem; border-radius: 7px; color: #34d399;">مدفوعة ومصروفة ✅</button>
              </div>
              <div style="font-size: 0.68rem; color: #94a3b8; font-weight: 750;" id="billsTotalSubheaderTxt">0 فاتورة مسجلة</div>
            </div>

            <!-- قائمة الفواتير -->
            <div id="billsListContentContainer">
              <!-- تتولد الفواتير برمجياً -->
            </div>
          </div>

          <!-- ========================================================
               2. قسم عرض الديون والقروض (Debts View)
               ======================================================== -->
          <div id="viewCommitmentsDebtsList" style="display: none;">
            <!-- فلاتر الديون السريعة -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 8px; flex-wrap: wrap;">
              <div style="display: flex; gap: 4px;" id="debtsFilterPills">
                <button type="button" class="btn-export-tool active" onclick="setDebtsStatusFilter('all', this)" style="padding: 4px 9px; font-size: 0.70rem; border-radius: 7px; background: rgba(56, 189, 248, 0.22); color: #38bdf8;">الكل</button>
                <button type="button" class="btn-export-tool" onclick="setDebtsStatusFilter('debt_on_us', this)" style="padding: 4px 9px; font-size: 0.70rem; border-radius: 7px; color: #f87171;">ديون علينا 🔴</button>
                <button type="button" class="btn-export-tool" onclick="setDebtsStatusFilter('debt_for_us', this)" style="padding: 4px 9px; font-size: 0.70rem; border-radius: 7px; color: #34d399;">ديون لنا 🟢</button>
                <button type="button" class="btn-export-tool" onclick="setDebtsStatusFilter('paid', this)" style="padding: 4px 9px; font-size: 0.70rem; border-radius: 7px; color: #94a3b8;">مسددة بالكامل 🎯</button>
              </div>
              <div style="font-size: 0.68rem; color: #94a3b8; font-weight: 750;" id="debtsTotalSubheaderTxt">0 ديون مسجلة</div>
            </div>

            <!-- قائمة الديون -->
            <div id="debtsListContentContainer">
              <!-- تتولد الديون برمجياً -->
            </div>
          </div>

        </div> <!-- إغلاق subViewCommitments -->
'''

if s_hero != -1 and s_budget != -1:
    html = html[:s_hero] + new_hero_and_tabs + '\n' + new_subViewCommitments + '\n        ' + html[s_budget:]
    print("✓ Successfully replaced Commitments HTML markup from scratch")
else:
    print("! Could not find s_hero or s_budget in index.html")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Saved HTML changes. New file length:", len(html))

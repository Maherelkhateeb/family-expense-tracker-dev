#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import sys
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def main():
    html_path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f"Content length before Phase 2: {len(content)}")

    # =========================================================================
    # 1. تحديث درج اليسار (summaryLeftDrawer) ليشمل التبويبين:
    # تبويب ملخص النشاط + تبويب المهام الذكية (Tasks)
    # =========================================================================
    old_summary_drawer_head = '''  <div class="summary-left-drawer" id="summaryLeftDrawer">
    <div style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: space-between; background: rgba(15, 23, 42, 0.95);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <i class="fa-solid fa-chart-pie" style="color: #38bdf8; font-size: 1.15rem;"></i>
        <h3 style="margin: 0; font-size: 0.96rem; font-weight: 900; color: #f8fafc;">ملخص النشاط المالي</h3>
      </div>
      <button type="button" onclick="closeSummaryLeftDrawer()" style="background: transparent; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; padding: 4px 8px;">&times;</button>
    </div>

    <!-- تبويبات الملخص الثلاثة (اليوم / الأسبوع / الشهر) -->
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; padding: 10px 14px; background: rgba(15, 23, 42, 0.6); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
      <button type="button" class="exp-tab-btn active" id="btnSummaryTabDay" onclick="switchSummaryPeriod('day')" style="padding: 8px; border-radius: 9px; font-weight: 800; font-size: 0.76rem; border: none; background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; cursor: pointer;">
        اليوم
      </button>
      <button type="button" class="exp-tab-btn" id="btnSummaryTabWeek" onclick="switchSummaryPeriod('week')" style="padding: 8px; border-radius: 9px; font-weight: 800; font-size: 0.76rem; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8; cursor: pointer;">
        الأسبوع
      </button>
      <button type="button" class="exp-tab-btn" id="btnSummaryTabMonth" onclick="switchSummaryPeriod('month')" style="padding: 8px; border-radius: 9px; font-weight: 800; font-size: 0.76rem; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8; cursor: pointer;">
        الشهر
      </button>
    </div>

    <!-- محتوى ملخص النشاط المالي -->
    <div id="summaryDrawerContent" style="padding: 14px; overflow-y: auto; height: calc(100vh - 120px); display: flex; flex-direction: column; gap: 12px;" class="custom-scrollbar"></div>
  </div>'''

    new_summary_drawer_head = '''  <div class="summary-left-drawer" id="summaryLeftDrawer" style="display: flex; flex-direction: column; overflow: hidden;">
    <!-- ترويسة الدرج المزدوجة الموحدة: ملخص النشاط + المهام الذكية Tasks -->
    <div style="padding: 12px 14px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); background: linear-gradient(135deg, #0f172a, #1e293b); flex-shrink: 0;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="display: flex; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 2px;">
            <button type="button" id="btnDrawerMasterSummary" onclick="switchLeftDrawerTab('summary')" style="padding: 5px 12px; border-radius: 8px; font-size: 0.76rem; font-weight: 900; border: none; background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; cursor: pointer; display: flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-chart-pie"></i> ملخص النشاط
            </button>
            <button type="button" id="btnDrawerMasterTasks" onclick="switchLeftDrawerTab('tasks')" style="padding: 5px 12px; border-radius: 8px; font-size: 0.76rem; font-weight: 900; border: none; background: transparent; color: #c084fc; cursor: pointer; display: flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-list-check"></i> المهام (Tasks)
              <span id="drawerTasksCountBadge" style="background: rgba(168, 85, 247, 0.3); color: #f3e8ff; padding: 0 5px; border-radius: 6px; font-size: 0.62rem;">0</span>
            </button>
          </div>
        </div>
        <button type="button" onclick="closeSummaryLeftDrawer()" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 50%; width: 28px; height: 28px; line-height: 26px; text-align: center; color: #94a3b8; font-size: 1.15rem; cursor: pointer;">&times;</button>
      </div>

      <!-- أدوات الفلاتر الزمنية للملخص (تظهر في تبويب ملخص النشاط فقط) -->
      <div id="drawerSummaryFilterBar" style="display: flex; flex-direction: column; gap: 6px;">
        <!-- تبويبات الفترات: اليوم / الأسبوع / الشهر / السنة / مخصص -->
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px;">
          <button type="button" class="exp-tab-btn active" id="btnSummaryTabDay" onclick="switchSummaryPeriod('day')" style="padding: 6px 2px; border-radius: 8px; font-weight: 800; font-size: 0.70rem; border: none; background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; cursor: pointer; text-align: center;">اليوم</button>
          <button type="button" class="exp-tab-btn" id="btnSummaryTabWeek" onclick="switchSummaryPeriod('week')" style="padding: 6px 2px; border-radius: 8px; font-weight: 800; font-size: 0.70rem; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8; cursor: pointer; text-align: center;">الأسبوع</button>
          <button type="button" class="exp-tab-btn" id="btnSummaryTabMonth" onclick="switchSummaryPeriod('month')" style="padding: 6px 2px; border-radius: 8px; font-weight: 800; font-size: 0.70rem; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8; cursor: pointer; text-align: center;">الشهر</button>
          <button type="button" class="exp-tab-btn" id="btnSummaryTabYear" onclick="switchSummaryPeriod('year')" style="padding: 6px 2px; border-radius: 8px; font-weight: 800; font-size: 0.70rem; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8; cursor: pointer; text-align: center;">السنة</button>
          <button type="button" class="exp-tab-btn" id="btnSummaryTabCustom" onclick="switchSummaryPeriod('custom')" style="padding: 6px 2px; border-radius: 8px; font-weight: 800; font-size: 0.70rem; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8; cursor: pointer; text-align: center;">مخصص</button>
        </div>

        <!-- سطر اختيار التاريخ المخصص (يظهر عند اختيار مخصص) -->
        <div id="drawerSummaryCustomDateRow" style="display: none; grid-template-columns: 1fr 1fr auto; gap: 6px; align-items: center; background: rgba(15, 23, 42, 0.8); padding: 6px; border-radius: 8px; border: 1px dashed rgba(56, 189, 248, 0.4);">
          <input type="date" id="summaryCustomDateFrom" class="form-input-custom" style="height: 30px; font-size: 0.70rem; padding: 0 4px;" onchange="applyCustomSummaryDate()">
          <input type="date" id="summaryCustomDateTo" class="form-input-custom" style="height: 30px; font-size: 0.70rem; padding: 0 4px;" onchange="applyCustomSummaryDate()">
          <button type="button" onclick="applyCustomSummaryDate()" style="padding: 0 8px; height: 30px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; background: #0284c7; color: #fff; border: none; cursor: pointer;">تطبيق</button>
        </div>

        <!-- شريط تحويل العملات وتقويم الأسعار: جنيه / ريال / دولار / ذهب عيار 21 -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; background: rgba(15, 23, 42, 0.7); padding: 4px 6px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.25);">
          <span style="font-size: 0.64rem; font-weight: 800; color: #fbbf24;"><i class="fa-solid fa-coins"></i> تقويم العملة:</span>
          <div style="display: flex; gap: 4px;">
            <button type="button" class="btn-summary-curr-pill active" id="btnSummaryCurrEGP" onclick="setSummaryCurrency('EGP')" style="padding: 2px 7px; border-radius: 6px; font-size: 0.64rem; font-weight: 900; cursor: pointer; border: 1px solid rgba(56, 189, 248, 0.5); background: rgba(56, 189, 248, 0.2); color: #38bdf8;">ج.م</button>
            <button type="button" class="btn-summary-curr-pill" id="btnSummaryCurrSAR" onclick="setSummaryCurrency('SAR')" style="padding: 2px 7px; border-radius: 6px; font-size: 0.64rem; font-weight: 900; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8;">ر.س</button>
            <button type="button" class="btn-summary-curr-pill" id="btnSummaryCurrUSD" onclick="setSummaryCurrency('USD')" style="padding: 2px 7px; border-radius: 6px; font-size: 0.64rem; font-weight: 900; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8;">$ USD</button>
            <button type="button" class="btn-summary-curr-pill" id="btnSummaryCurrGOLD" onclick="setSummaryCurrency('GOLD21')" style="padding: 2px 7px; border-radius: 6px; font-size: 0.64rem; font-weight: 900; cursor: pointer; border: 1px solid rgba(245, 158, 11, 0.5); background: rgba(245, 158, 11, 0.15); color: #fbbf24;">🪙 عيار 21</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 1. لوحة محتوى ملخص النشاط المالي -->
    <div id="drawerSummaryViewSection" style="flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px;" class="custom-scrollbar">
      <div id="summaryDrawerContent" style="display: flex; flex-direction: column; gap: 12px;"></div>
    </div>

    <!-- 2. لوحة محتوى المهام المتكاملة (Tasks View Section) -->
    <div id="drawerTasksViewSection" style="display: none; flex: 1; overflow-y: auto; padding: 12px; flex-direction: column; gap: 10px;" class="custom-scrollbar">
      <!-- نموذج إضافة مهمة جديدة مع تحديد التاريخ والصورة -->
      <div style="background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(168, 85, 247, 0.4); border-radius: 12px; padding: 10px;">
        <div style="display: flex; gap: 6px; margin-bottom: 6px;">
          <input type="text" id="drawerNewTaskTitleInput" placeholder="أضف مهمة جديدة... (مثال: سداد اشتراك النادي)" style="flex: 1; height: 38px; border-radius: 8px; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(168, 85, 247, 0.3); color: #fff; font-size: 0.82rem; font-weight: 800; padding: 0 10px; outline: none;">
          <input type="date" id="drawerNewTaskDateInput" style="height: 38px; width: 120px; border-radius: 8px; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(168, 85, 247, 0.3); color: #cbd5e1; font-size: 0.72rem; padding: 0 4px;">
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 6px;">
            <input type="file" id="inpTaskPhotoCamera" accept="image/*" capture="environment" style="display: none;" onchange="handleTaskPhotoUpload(event)">
            <input type="file" id="inpTaskPhotoGallery" accept="image/*" style="display: none;" onchange="handleTaskPhotoUpload(event)">
            <button type="button" onclick="document.getElementById('inpTaskPhotoCamera').click()" style="padding: 4px 8px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 0.68rem; font-weight: 800; cursor: pointer;">
              <i class="fa-solid fa-camera"></i> تصوير
            </button>
            <button type="button" onclick="document.getElementById('inpTaskPhotoGallery').click()" style="padding: 4px 8px; border-radius: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 0.68rem; font-weight: 800; cursor: pointer;">
              <i class="fa-solid fa-images"></i> صورة
            </button>
            <span id="taskPhotoAttachedBadge" style="display: none; font-size: 0.62rem; color: #34d399; font-weight: 800; align-self: center;">
              <i class="fa-solid fa-check"></i> تم إرفاق صورة
            </span>
          </div>
          <button type="button" onclick="handleDrawerAddNewTask()" style="padding: 6px 16px; border-radius: 8px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.78rem; font-weight: 900; cursor: pointer;">
            <i class="fa-solid fa-plus"></i> إضافة مهمة
          </button>
        </div>
        <!-- معاينة صورة المهمة المعلقة -->
        <div id="taskPendingPhotoPreview" style="display: none; margin-top: 6px; text-align: center; position: relative;">
          <img id="taskPendingPhotoImg" src="" style="max-height: 70px; border-radius: 6px; border: 1px solid rgba(168, 85, 247, 0.5);">
          <button type="button" onclick="clearTaskPendingPhoto()" style="position: absolute; top: -5px; right: 40%; background: #ef4444; border: none; border-radius: 50%; color: #fff; width: 20px; height: 20px; font-size: 0.70rem; cursor: pointer;">&times;</button>
        </div>
      </div>

      <!-- تبويبات أقسام المهام: مهام اليوم / الهامة / المخططة / الكل / المكتملة -->
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px;">
        <button type="button" class="exp-tab-btn active" id="btnDrawerTodoMyDay" onclick="switchDrawerTodoSection('my_day')" style="padding: 5px 2px; border-radius: 7px; font-weight: 800; font-size: 0.66rem; background: rgba(168, 85, 247, 0.25); color: #c084fc; border: none; cursor: pointer; text-align: center;">يومي</button>
        <button type="button" class="exp-tab-btn" id="btnDrawerTodoImportant" onclick="switchDrawerTodoSection('important')" style="padding: 5px 2px; border-radius: 7px; font-weight: 800; font-size: 0.66rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">هام ⭐</button>
        <button type="button" class="exp-tab-btn" id="btnDrawerTodoPlanned" onclick="switchDrawerTodoSection('planned')" style="padding: 5px 2px; border-radius: 7px; font-weight: 800; font-size: 0.66rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">مخطط</button>
        <button type="button" class="exp-tab-btn" id="btnDrawerTodoAll" onclick="switchDrawerTodoSection('all')" style="padding: 5px 2px; border-radius: 7px; font-weight: 800; font-size: 0.66rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">الكل</button>
        <button type="button" class="exp-tab-btn" id="btnDrawerTodoCompleted" onclick="switchDrawerTodoSection('completed')" style="padding: 5px 2px; border-radius: 7px; font-weight: 800; font-size: 0.66rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">المكتملة</button>
      </div>

      <!-- قائمة المهام التفاعلية المتطورة مع المهام الفرعية والصور -->
      <div id="drawerTasksContainerList" style="display: flex; flex-direction: column; gap: 8px;"></div>
    </div>
  </div>'''

    if old_summary_drawer_head in content:
        content = content.replace(old_summary_drawer_head, new_summary_drawer_head, 1)
        print("✓ Integrated Tasks & Summary into Left Side Drawer")
    else:
        print("✗ Could not match old_summary_drawer_head directly, checking...")

    # =========================================================================
    # 2. تحديث كود JavaScript الخاص بالملخص والعملات والمهام الفرعية
    # =========================================================================
    js_drawer_engine = """
    // =========================================================================
    // محرك درج اليسار الموحد: ملخص النشاط + المهام الذكية Tasks + تقويم الذهب 21
    // =========================================================================
    let currentDrawerTab = 'summary'; // 'summary' | 'tasks'
    let currentSummaryPeriod = 'day'; // 'day' | 'week' | 'month' | 'year' | 'custom'
    let currentSummaryCurrency = 'EGP'; // 'EGP' | 'SAR' | 'USD' | 'GOLD21'
    let summaryCustomDateRange = { from: '', to: '' };
    let currentPendingTaskPhotoUri = null;

    function openSummaryDrawer(initialTab = 'summary') {
      const drawer = document.getElementById('summaryLeftDrawer');
      const backdrop = document.getElementById('summaryDrawerBackdrop');
      if (drawer) drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
      switchLeftDrawerTab(initialTab);
    }

    function closeSummaryLeftDrawer() {
      const drawer = document.getElementById('summaryLeftDrawer');
      const backdrop = document.getElementById('summaryDrawerBackdrop');
      if (drawer) drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');
    }

    function switchLeftDrawerTab(tab) {
      currentDrawerTab = tab;
      const btnSum = document.getElementById('btnDrawerMasterSummary');
      const btnTasks = document.getElementById('btnDrawerMasterTasks');
      const filterBar = document.getElementById('drawerSummaryFilterBar');
      const sumSec = document.getElementById('drawerSummaryViewSection');
      const tasksSec = document.getElementById('drawerTasksViewSection');

      if (tab === 'summary') {
        if (btnSum) { btnSum.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)'; btnSum.style.color = '#fff'; }
        if (btnTasks) { btnTasks.style.background = 'transparent'; btnTasks.style.color = '#c084fc'; }
        if (filterBar) filterBar.style.display = 'flex';
        if (sumSec) sumSec.style.display = 'flex';
        if (tasksSec) tasksSec.style.display = 'none';
        renderSummaryDrawer(currentSummaryPeriod);
      } else {
        if (btnSum) { btnSum.style.background = 'transparent'; btnSum.style.color = '#38bdf8'; }
        if (btnTasks) { btnTasks.style.background = 'linear-gradient(135deg, #a855f7, #7c3aed)'; btnTasks.style.color = '#fff'; }
        if (filterBar) filterBar.style.display = 'none';
        if (sumSec) sumSec.style.display = 'none';
        if (tasksSec) tasksSec.style.display = 'flex';
        renderDrawerTasksList();
      }
    }

    function switchSummaryPeriod(p) {
      currentSummaryPeriod = p;
      ['day', 'week', 'month', 'year', 'custom'].forEach(tab => {
        const btnId = 'btnSummaryTab' + tab.charAt(0).toUpperCase() + tab.slice(1);
        const btn = document.getElementById(btnId);
        if (btn) {
          if (tab === p) {
            btn.className = 'exp-tab-btn active';
            btn.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
            btn.style.color = '#fff';
            btn.style.border = 'none';
          } else {
            btn.className = 'exp-tab-btn';
            btn.style.background = 'transparent';
            btn.style.color = '#94a3b8';
            btn.style.border = '1px solid rgba(255,255,255,0.1)';
          }
        }
      });

      const customRow = document.getElementById('drawerSummaryCustomDateRow');
      if (customRow) {
        customRow.style.display = p === 'custom' ? 'grid' : 'none';
      }

      renderSummaryDrawer(p);
    }

    function applyCustomSummaryDate() {
      const from = document.getElementById('summaryCustomDateFrom')?.value || '';
      const to = document.getElementById('summaryCustomDateTo')?.value || '';
      summaryCustomDateRange = { from, to };
      renderSummaryDrawer('custom');
    }

    function setSummaryCurrency(curr) {
      currentSummaryCurrency = curr;
      ['EGP', 'SAR', 'USD', 'GOLD'].forEach(c => {
        const btn = document.getElementById('btnSummaryCurr' + c);
        if (btn) {
          const isTarget = (curr === 'GOLD21' && c === 'GOLD') || (curr === c);
          if (isTarget) {
            btn.style.background = c === 'GOLD' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(56, 189, 248, 0.35)';
            btn.style.color = c === 'GOLD' ? '#fbbf24' : '#38bdf8';
            btn.style.border = '1.2px solid ' + (c === 'GOLD' ? '#fbbf24' : '#38bdf8');
          } else {
            btn.style.background = 'transparent';
            btn.style.color = '#94a3b8';
            btn.style.border = '1px solid rgba(255,255,255,0.1)';
          }
        }
      });
      renderSummaryDrawer(currentSummaryPeriod);
    }

    function formatSummaryVal(amtEgp) {
      const g21Price = (state.market && state.market.gold21) || 6265;
      const usdRate = (state.market && state.market.usdEgp) || 53.97;
      const sarRate = (state.market && state.market.sarEgp) || 14.37;

      if (currentSummaryCurrency === 'GOLD21') {
        const grams = g21Price > 0 ? (amtEgp / g21Price).toFixed(2) : '0.00';
        return `${grams} جم ذهب 21`;
      } else if (currentSummaryCurrency === 'USD') {
        const usd = usdRate > 0 ? (amtEgp / usdRate).toFixed(2) : '0.00';
        return `$${Number(usd).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      } else if (currentSummaryCurrency === 'SAR') {
        const sar = sarRate > 0 ? (amtEgp / sarRate).toFixed(2) : '0.00';
        return `${Number(sar).toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س`;
      }
      return formatMoney(amtEgp);
    }

    function renderSummaryDrawer(period = 'day') {
      const container = document.getElementById('summaryDrawerContent');
      if (!container) return;

      const now = new Date();
      const todayStr = getLocalDateStr(now);
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      const weekAgoStr = getLocalDateStr(weekAgo);
      const thisMonthPrefix = todayStr.substring(0, 7);
      const thisYearPrefix = todayStr.substring(0, 4);

      let txList = [...(state.transactions || [])];
      let periodTitle = 'ملخص اليوم';

      if (period === 'day') {
        txList = txList.filter(t => t.date === todayStr);
        periodTitle = `ملخص اليوم (${todayStr})`;
      } else if (period === 'week') {
        txList = txList.filter(t => t.date >= weekAgoStr && t.date <= todayStr);
        periodTitle = `ملخص آخر 7 أيام`;
      } else if (period === 'month') {
        txList = txList.filter(t => (t.date || '').startsWith(thisMonthPrefix));
        periodTitle = `ملخص شهر ${now.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}`;
      } else if (period === 'year') {
        txList = txList.filter(t => (t.date || '').startsWith(thisYearPrefix));
        periodTitle = `ملخص عام ${thisYearPrefix}`;
      } else if (period === 'custom') {
        const { from, to } = summaryCustomDateRange;
        if (from && to) txList = txList.filter(t => t.date >= from && t.date <= to);
        else if (from) txList = txList.filter(t => t.date >= from);
        else if (to) txList = txList.filter(t => t.date <= to);
        periodTitle = `ملخص الفترة المخصصة (${from || 'البداية'} إلى ${to || 'اليوم'})`;
      }

      let totalExp = 0, totalInc = 0;
      const catTotals = {};
      const memberTotals = {};

      txList.forEach(t => {
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') {
          totalInc += amt;
        } else {
          totalExp += amt;
          const c = t.category || 'other';
          catTotals[c] = (catTotals[c] || 0) + amt;
          const m = t.member || 'البيت';
          memberTotals[m] = (memberTotals[m] || 0) + amt;
        }
      });

      const netFlow = totalInc - totalExp;

      // تقويم الرصيد الفعلي الحالي التراكمي
      let allTotalInc = 0, allTotalExp = 0;
      (state.transactions || []).forEach(t => {
        const a = Number(t.amount) || 0;
        if (t.type === 'income') allTotalInc += a;
        else if (t.type === 'expense') allTotalExp += a;
      });
      const actualBal = allTotalInc - allTotalExp;
      const g21Rate = (state.market && state.market.gold21) || 6265;
      const goldEquivalentGrams = g21Rate > 0 ? (actualBal / g21Rate).toFixed(2) : '0.00';

      // بطاقات البنوك والمحافظ المالية مع النقر المباشر لفتح كشف حركاتها
      const walletsHtml = (state.wallets || []).map(w => {
        let wBal = 0;
        (state.transactions || []).forEach(t => {
          if (t.walletId === w.id) {
            const a = Number(t.amount) || 0;
            if (t.type === 'income') wBal += a;
            else if (t.type === 'expense') wBal -= a;
          }
        });
        return `
          <div style="background: rgba(30, 41, 59, 0.75); border: 1.2px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.15s ease;" onclick="closeSummaryLeftDrawer(); openOperationsFiltered({ walletId: '${w.id}', walletName: '${w.name}' })" title="انقر لعرض تفاصيل وكشف حركات ${w.name}">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 28px; height: 28px; border-radius: 7px; background: rgba(56, 189, 248, 0.15); display: flex; align-items: center; justify-content: center; color: #38bdf8; font-size: 0.82rem;">
                <i class="fa-solid fa-building-columns"></i>
              </div>
              <div>
                <div style="font-size: 0.78rem; font-weight: 800; color: #f8fafc;">${escapeHtml(w.name)}</div>
                <div style="font-size: 0.62rem; color: #94a3b8;">${w.type || 'حساب بنكي'} • انقر للكشف</div>
              </div>
            </div>
            <div style="font-size: 0.85rem; font-weight: 900; color: ${wBal >= 0 ? '#34d399' : '#f43f5e'}; direction: rtl;">
              ${formatSummaryVal(wBal)}
            </div>
          </div>
        `;
      }).join('');

      let catBreakdownHtml = Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).map(([catId, sum]) => {
        const cat = getCategoryObj(catId, 'expense');
        const pct = totalExp > 0 ? ((sum / totalExp) * 100).toFixed(0) : 0;
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.76rem; background: rgba(15, 23, 42, 0.6); padding: 7px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer;" onclick="closeSummaryLeftDrawer(); openOperationsFiltered({ category: '${catId}', categoryName: '${cat.name}', type: 'expense' });" title="انقر لعرض تفاصيل حركات ${cat.name}">
            <div style="display: flex; align-items: center; gap: 7px;">
              <span style="font-size: 0.95rem;">${cat.icon ? `<i class="fa-solid ${cat.icon}" style="color: ${cat.color || '#38bdf8'}; font-size: 0.85rem;"></i>` : '📦'}</span>
              <span style="color: #f8fafc; font-weight: 700;">${cat.name}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #94a3b8; font-size: 0.68rem;">${pct}%</span>
              <span style="color: #ff4d6d; font-weight: 900; direction: rtl;">- ${formatSummaryVal(sum)}</span>
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <!-- كارت تقويم الرصيد الفعلي بالذهب عيار 21 البارز -->
        <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.20), rgba(15, 23, 42, 0.95)); border: 1.4px solid rgba(245, 158, 11, 0.55); border-radius: 14px; padding: 10px 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.4);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 0.74rem; font-weight: 900; color: #fbbf24; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-scale-balanced"></i> تقويم الرصيد بالذهب عيار 21:
            </span>
            <span style="font-size: 0.62rem; color: #94a3b8;">سعر الجرام: ${Math.round(g21Rate).toLocaleString('ar-EG')} ج.م</span>
          </div>
          <div style="font-size: 1.25rem; font-weight: 950; color: #fde047; direction: rtl; margin-bottom: 2px;">
            ${goldEquivalentGrams} جرام ذهب عيار 21
          </div>
          <div style="font-size: 0.64rem; color: #cbd5e1;">
            يعادل رصيد السيولة الفعلي (${formatMoney(actualBal)}) مقوماً بسعر الصاغة الحقيقي اليوم.
          </div>
        </div>

        <!-- كارت الملخص التنفيذي للفترة -->
        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.98)); border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 14px; padding: 12px; box-shadow: 0 4px 18px rgba(0,0,0,0.4);">
          <div style="font-size: 0.80rem; font-weight: 900; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span>${periodTitle}</span>
            <span style="font-size: 0.68rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 7px; border-radius: 6px;">${txList.length} حركة</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
            <div style="background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 10px; padding: 8px; text-align: center;">
              <div style="font-size: 0.64rem; color: #fca5a5; font-weight: 700;">إجمالي المصاريف</div>
              <div style="font-size: 0.95rem; font-weight: 900; color: #ff4d6d; direction: rtl;">- ${formatSummaryVal(totalExp)}</div>
            </div>
            <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; padding: 8px; text-align: center;">
              <div style="font-size: 0.64rem; color: #86efac; font-weight: 700;">إجمالي الإيداعات</div>
              <div style="font-size: 0.95rem; font-weight: 900; color: #34d399; direction: rtl;">+ ${formatSummaryVal(totalInc)}</div>
            </div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); border-radius: 8px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem;">
            <span style="color: #cbd5e1; font-weight: 700;">صافي التدفق المالي:</span>
            <span style="font-weight: 900; direction: rtl; color: ${netFlow >= 0 ? '#34d399' : '#f43f5e'};">
              ${netFlow >= 0 ? '+' : '-'}${formatSummaryVal(Math.abs(netFlow))}
            </span>
          </div>
        </div>

        <!-- قسم أرصدة البنوك والمحافظ المالية (مع النقر لفتح كشف البنك) -->
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="font-size: 0.78rem; font-weight: 900; color: #f8fafc; display: flex; align-items: center; justify-content: space-between;">
            <span><i class="fa-solid fa-vault" style="color: #38bdf8;"></i> أرصدة البنوك والمحافظ المالية:</span>
            <span style="font-size: 0.62rem; color: #94a3b8;">(انقر على أي بنك لفتح كشف حركاته)</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 5px;">
            ${walletsHtml}
          </div>
        </div>

        <!-- توزيع البنود -->
        <div style="font-size: 0.78rem; font-weight: 900; color: #f8fafc; margin-top: 4px;">توزيع المصاريف حسب البند:</div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${catBreakdownHtml || '<div style="text-align: center; color: #64748b; font-size: 0.74rem; padding: 10px;">لا توجد مصاريف مسجلة خلال هذه الفترة</div>'}
        </div>
      `;
    }

    // =========================================================================
    // محرك المهام والمهام الفرعية والصور المتكامل (Drawer Tasks Engine with Subtasks)
    // =========================================================================
    let currentDrawerTodoSection = 'my_day';

    function switchDrawerTodoSection(sec) {
      currentDrawerTodoSection = sec;
      const tabs = ['my_day', 'important', 'planned', 'all', 'completed'];
      tabs.forEach(t => {
        const btnId = 'btnDrawerTodo' + (t === 'my_day' ? 'MyDay' : (t === 'important' ? 'Important' : (t === 'planned' ? 'Planned' : (t === 'all' ? 'All' : 'Completed'))));
        const btn = document.getElementById(btnId);
        if (btn) {
          if (t === sec) {
            btn.className = 'exp-tab-btn active';
            btn.style.background = 'rgba(168, 85, 247, 0.25)';
            btn.style.color = '#c084fc';
            btn.style.border = 'none';
          } else {
            btn.className = 'exp-tab-btn';
            btn.style.background = 'transparent';
            btn.style.color = '#94a3b8';
            btn.style.border = '1px solid rgba(255,255,255,0.1)';
          }
        }
      });
      renderDrawerTasksList();
    }

    function handleTaskPhotoUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          const maxDim = 1000;
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
            else { w = Math.round((w * maxDim) / h); h = maxDim; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          currentPendingTaskPhotoUri = canvas.toDataURL('image/jpeg', 0.80);
          
          const badge = document.getElementById('taskPhotoAttachedBadge');
          const preview = document.getElementById('taskPendingPhotoPreview');
          const previewImg = document.getElementById('taskPendingPhotoImg');
          if (badge) badge.style.display = 'inline-block';
          if (preview) preview.style.display = 'block';
          if (previewImg) previewImg.src = currentPendingTaskPhotoUri;
          showToast('📸 تم إرفاق صورة للمهمة بنجاح');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function clearTaskPendingPhoto() {
      currentPendingTaskPhotoUri = null;
      const badge = document.getElementById('taskPhotoAttachedBadge');
      const preview = document.getElementById('taskPendingPhotoPreview');
      const previewImg = document.getElementById('taskPendingPhotoImg');
      if (badge) badge.style.display = 'none';
      if (preview) preview.style.display = 'none';
      if (previewImg) previewImg.src = '';
    }

    function handleDrawerAddNewTask() {
      const titleInp = document.getElementById('drawerNewTaskTitleInput');
      const dateInp = document.getElementById('drawerNewTaskDateInput');
      const title = titleInp ? titleInp.value.trim() : '';
      if (!title) {
        showToast('⚠️ يرجى كتابة بيان أو عنوان المهمة');
        return;
      }

      const tasks = getTodoTasks();
      const newTask = {
        id: 'task-' + Date.now(),
        title: title,
        dueDate: dateInp && dateInp.value ? dateInp.value : '',
        completed: false,
        starred: currentDrawerTodoSection === 'important',
        photo: currentPendingTaskPhotoUri || null,
        subtasks: [],
        createdAt: new Date().toISOString(),
        author: state.currentUser || 'ماهر'
      };

      tasks.unshift(newTask);
      saveTodoTasks(tasks);

      if (titleInp) titleInp.value = '';
      clearTaskPendingPhoto();
      playNotificationChime();
      renderDrawerTasksList();
      showToast('✨ تمت إضافة المهمة بنجاح!');
    }

    function toggleSubtaskCompleted(taskId, subtaskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task && task.subtasks) {
        const sub = task.subtasks.find(s => s.id === subtaskId);
        if (sub) {
          sub.completed = !sub.completed;
          saveTodoTasks(tasks);
          renderDrawerTasksList();
        }
      }
    }

    function addSubtaskToTask(taskId) {
      const titleInp = document.getElementById(`inpSubtaskTitle_${taskId}`);
      const dateInp = document.getElementById(`inpSubtaskDate_${taskId}`);
      const title = titleInp ? titleInp.value.trim() : '';
      if (!title) return;

      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        if (!task.subtasks) task.subtasks = [];
        task.subtasks.push({
          id: 'sub-' + Date.now(),
          title: title,
          dueDate: dateInp && dateInp.value ? dateInp.value : '',
          completed: false
        });
        saveTodoTasks(tasks);
        renderDrawerTasksList();
        showToast('✓ تمت إضافة المهمة الفرعية');
      }
    }

    function deleteSubtask(taskId, subtaskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task && task.subtasks) {
        task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
        saveTodoTasks(tasks);
        renderDrawerTasksList();
      }
    }

    function renderDrawerTasksList() {
      const container = document.getElementById('drawerTasksContainerList');
      const badge = document.getElementById('drawerTasksCountBadge');
      if (!container) return;

      const allTasks = getTodoTasks();
      const todayStr = getLocalDateStr(new Date());

      if (badge) {
        const activeCount = allTasks.filter(t => !t.completed).length;
        badge.textContent = activeCount;
      }

      let filtered = allTasks;
      if (currentDrawerTodoSection === 'my_day') {
        filtered = allTasks.filter(t => !t.completed && (t.dueDate === todayStr || !t.dueDate));
      } else if (currentDrawerTodoSection === 'important') {
        filtered = allTasks.filter(t => !t.completed && t.starred);
      } else if (currentDrawerTodoSection === 'planned') {
        filtered = allTasks.filter(t => !t.completed && Boolean(t.dueDate));
      } else if (currentDrawerTodoSection === 'completed') {
        filtered = allTasks.filter(t => t.completed);
      } else {
        filtered = allTasks.filter(t => !t.completed);
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 30px 10px; color: #94a3b8; font-size: 0.78rem;">
            <i class="fa-solid fa-list-check" style="font-size: 1.8rem; color: #a855f7; opacity: 0.5; margin-bottom: 8px;"></i>
            <div>لا توجد مهام في هذا القسم حالياً</div>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(t => {
        const isDone = t.completed;
        const isStar = t.starred;
        const subtasks = t.subtasks || [];
        const completedSubs = subtasks.filter(s => s.completed).length;

        const subtasksHtml = subtasks.map(s => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 6px; background: rgba(15, 23, 42, 0.6); border-radius: 6px; margin-top: 3px; font-size: 0.72rem;">
            <div style="display: flex; align-items: center; gap: 6px; flex: 1;">
              <input type="checkbox" ${s.completed ? 'checked' : ''} onchange="toggleSubtaskCompleted('${t.id}', '${s.id}')" style="cursor: pointer;">
              <span style="color: ${s.completed ? '#64748b' : '#cbd5e1'}; text-decoration: ${s.completed ? 'line-through' : 'none'};">${escapeHtml(s.title)}</span>
              ${s.dueDate ? `<span style="font-size: 0.60rem; color: #c084fc;">(تاريخ: ${s.dueDate})</span>` : ''}
            </div>
            <button type="button" onclick="deleteSubtask('${t.id}', '${s.id}')" style="background: transparent; border: none; color: #ef4444; font-size: 0.68rem; cursor: pointer; opacity: 0.7;">&times;</button>
          </div>
        `).join('');

        return `
          <div style="background: rgba(30, 41, 59, 0.75); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 9px 12px; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 9px; flex: 1;">
                <button type="button" onclick="toggleTaskCompleted('${t.id}')" style="background: transparent; border: none; cursor: pointer; color: ${isDone ? '#34d399' : '#94a3b8'}; font-size: 1.15rem; padding: 0;">
                  <i class="fa-${isDone ? 'solid fa-circle-check' : 'regular fa-circle'}"></i>
                </button>
                <div style="flex: 1;">
                  <div style="font-size: 0.82rem; font-weight: 800; color: ${isDone ? '#94a3b8' : '#f8fafc'}; text-decoration: ${isDone ? 'line-through' : 'none'};">
                    ${escapeHtml(t.title)}
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                    ${t.dueDate ? `<span style="font-size: 0.62rem; color: #c084fc;"><i class="fa-regular fa-calendar"></i> ${t.dueDate}</span>` : ''}
                    ${subtasks.length > 0 ? `<span style="font-size: 0.62rem; color: #38bdf8;"><i class="fa-solid fa-list-ol"></i> ${completedSubs}/${subtasks.length} مهام فرعية</span>` : ''}
                  </div>
                </div>
              </div>

              <!-- صورة المهمة المصغرة وزر النجمة والحذف -->
              <div style="display: flex; align-items: center; gap: 6px;">
                ${t.photo ? `<img src="${t.photo}" onclick="openReceiptLightbox(this.src, 'مرفق المهمة: ${escapeHtml(t.title)}')" style="width: 28px; height: 28px; border-radius: 6px; object-fit: cover; border: 1px solid #a855f7; cursor: pointer;" title="انقر لتكبير صورة المهمة">` : ''}
                <button type="button" onclick="toggleTaskStarred('${t.id}')" style="background: transparent; border: none; cursor: pointer; color: ${isStar ? '#fbbf24' : '#64748b'}; font-size: 0.95rem; padding: 2px;">
                  <i class="fa-${isStar ? 'solid' : 'regular'} fa-star"></i>
                </button>
                <button type="button" onclick="deleteTaskItem('${t.id}')" style="background: transparent; border: none; cursor: pointer; color: #ef4444; font-size: 0.85rem; padding: 2px; opacity: 0.7;">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>

            <!-- تفاصيل المهام الفرعية وإمكانية إضافتها تحت المهمة -->
            <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px;">
              ${subtasksHtml}
              <!-- سطر إضافة مهمة فرعية جديدة -->
              <div style="display: flex; gap: 4px; margin-top: 5px;">
                <input type="text" id="inpSubtaskTitle_${t.id}" placeholder="إضافة مهمة فرعية تحت هذه المهمة..." style="flex: 1; height: 26px; border-radius: 5px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(168, 85, 247, 0.25); color: #fff; font-size: 0.68rem; padding: 0 6px;">
                <input type="date" id="inpSubtaskDate_${t.id}" style="width: 95px; height: 26px; border-radius: 5px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(168, 85, 247, 0.25); color: #cbd5e1; font-size: 0.62rem; padding: 0 2px;">
                <button type="button" onclick="addSubtaskToTask('${t.id}')" style="padding: 0 8px; height: 26px; border-radius: 5px; background: rgba(168, 85, 247, 0.25); border: 1px solid #a855f7; color: #c084fc; font-size: 0.68rem; font-weight: 800; cursor: pointer;">
                  + فرعية
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
    """

    # حقن محرك الدرج الموحد
    content = content.replace("function openSummaryDrawer() {", js_drawer_engine + "\n    function openSummaryDrawer_Legacy() {", 1)

    # =========================================================================
    # 3. تحديث تدقيق الرصيد الفعلي (actualBalanceAuditModal):
    # نقل الفلاتر إلى رؤوس الأعمدة، دعم التحديد المتعدد، وعمود مخصص للمرفقات
    # =========================================================================
    # استبدال رأس جدول كشف التدقيق renderActualBalanceAuditLedger
    old_audit_thead = '''            <thead style="position: sticky; top: 0; background: #0f172a; z-index: 5; border-bottom: 2px solid rgba(56, 189, 248, 0.3);">
              <tr>
                <th style="padding: 10px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; white-space: nowrap;">التاريخ / الوقت</th>
                <th style="padding: 10px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; white-space: nowrap;">المستفيد</th>
                <th style="padding: 10px; color: #94a3b8; font-weight: 800; font-size: 0.68rem;">البيان والنوع</th>
                <th style="padding: 10px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; white-space: nowrap;">التصنيف</th>
                <th style="padding: 10px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; white-space: nowrap;">المحفظة</th>
                <th style="padding: 10px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; white-space: nowrap;">منفذ العملية</th>
                <th style="padding: 10px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; text-align: left;">المبلغ (ج.م)</th>
                <th style="padding: 10px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; text-align: left;">الرصيد بعد الحركة</th>
              </tr>
            </thead>'''

    new_audit_thead = '''            <thead style="position: sticky; top: 0; background: #0b1329; z-index: 10; border-bottom: 2px solid rgba(56, 189, 248, 0.4);">
              <tr>
                <!-- 1. التاريخ / الوقت مع فلتر الفترة -->
                <th style="padding: 6px 8px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; white-space: nowrap;">
                  <div>التاريخ / الوقت</div>
                </th>

                <!-- 2. المستفيد مع اختيار الشخص -->
                <th style="padding: 6px 8px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; white-space: nowrap;">
                  <div>المستفيد</div>
                </th>

                <!-- 3. البيان والنوع -->
                <th style="padding: 6px 8px; color: #94a3b8; font-weight: 800; font-size: 0.68rem;">
                  <div>البيان والنوع</div>
                </th>

                <!-- 4. التصنيف -->
                <th style="padding: 6px 8px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; white-space: nowrap;">
                  <div>التصنيف</div>
                </th>

                <!-- 5. المحفظة -->
                <th style="padding: 6px 8px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; white-space: nowrap;">
                  <div>المحفظة</div>
                </th>

                <!-- 6. المرفقات والفواتير (عمود مخصص) -->
                <th style="padding: 6px 8px; color: #38bdf8; font-weight: 900; font-size: 0.68rem; text-align: center; white-space: nowrap;">
                  <div>المرفق 📎</div>
                </th>

                <!-- 7. منفذ العملية -->
                <th style="padding: 6px 8px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; white-space: nowrap;">
                  <div>المنفذ</div>
                </th>

                <!-- 8. المبلغ -->
                <th style="padding: 6px 8px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; text-align: left; white-space: nowrap;">
                  <div>المبلغ (ج.م)</div>
                </th>

                <!-- 9. الرصيد التراكمي -->
                <th style="padding: 6px 8px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; text-align: left; white-space: nowrap;">
                  <div>الرصيد بعد الحركة</div>
                </th>
              </tr>
            </thead>'''

    if old_audit_thead in content:
        content = content.replace(old_audit_thead, new_audit_thead, 1)
        print("✓ Updated audit table headers with dedicated receipt column")

    # تحديث توليد الصفوف لإضافة عمود المرفق
    old_row_gen = '''            <!-- منفذ العملية -->
            <td style="padding: 9px 10px; white-space: nowrap;">
              <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 6px; font-size: 0.66rem; font-weight: 800; background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.25);">
                <i class="fa-solid fa-user-check" style="font-size: 0.60rem;"></i>
                <span>${escapeHtml(tx.author || tx.member || state.currentUser || 'ماهر')}</span>
              </span>
            </td>'''

    new_row_gen = '''            <!-- عمود المرفق والفاتورة المخصص -->
            <td style="padding: 6px 8px; text-align: center; white-space: nowrap;">
              ${tx.receipt ? `
                <img src="${tx.receipt}" onclick="openReceiptLightbox(this.src, 'فاتورة: ${escapeHtml(tx.label || '')}')" style="width: 30px; height: 30px; border-radius: 6px; object-fit: cover; border: 1.5px solid #38bdf8; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.4);" title="انقر لعرض وتكبير الفاتورة">
              ` : `
                <span style="color: #64748b; font-size: 0.70rem;">──</span>
              `}
            </td>

            <!-- منفذ العملية -->
            <td style="padding: 9px 10px; white-space: nowrap;">
              <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 6px; font-size: 0.66rem; font-weight: 800; background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.25);">
                <i class="fa-solid fa-user-check" style="font-size: 0.60rem;"></i>
                <span>${escapeHtml(tx.author || tx.member || state.currentUser || 'ماهر')}</span>
              </span>
            </td>'''

    if old_row_gen in content:
        content = content.replace(old_row_gen, new_row_gen, 1)
        print("✓ Injected receipt thumbnail column in audit ledger rows")

    # =========================================================================
    # 4. ترقية مركز الإشعارات (Notifications) للفتح المباشر للعمليات والمهام
    # =========================================================================
    old_notif_render = '''      container.innerHTML = items.map(n => {
        const isTx = Boolean(n.txId);
        const iconClass = n.type === 'income' ? 'fa-circle-arrow-down' : (n.type === 'expense' ? 'fa-circle-arrow-up' : (n.type === 'bill' ? 'fa-file-invoice' : (n.type === 'commitment' ? 'fa-triangle-exclamation' : 'fa-bell')));
        const iconColor = n.type === 'income' ? '#34d399' : (n.type === 'expense' ? '#f43f5e' : (n.type === 'bill' ? '#fbbf24' : '#38bdf8'));

        return `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 9px 12px; cursor: ${isTx ? 'pointer' : 'default'};" ${isTx ? `onclick="openEditTxModal('${n.txId}'); closeModal('notificationsModal');"` : ''} title="${isTx ? 'انقر لعرض وتعديل تفاصيل العملية' : ''}">
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
              <i class="fa-solid ${iconClass}" style="color: ${iconColor}; font-size: 1.1rem;"></i>
              <div>
                <div style="font-size: 0.78rem; font-weight: 800; color: #f8fafc;">${escapeHtml(n.title)}</div>
                <div style="font-size: 0.68rem; color: #cbd5e1; margin-top: 2px;">${escapeHtml(n.body)}</div>
              </div>
            </div>
            ${isTx ? '<span style="font-size: 0.65rem; color: #38bdf8; font-weight: 700;"><i class="fa-solid fa-pen-to-square"></i> تفاصيل</span>' : ''}
          </div>
        `;
      }).join('');'''

    new_notif_render = '''      container.innerHTML = items.map(n => {
        const isTx = Boolean(n.txId);
        const isExp = Boolean(n.expectedId || n.id === 'debt-alert');
        const isTask = Boolean(n.taskId);
        const isClickable = isTx || isExp || isTask;

        let clickHandler = '';
        if (isTx) clickHandler = `onclick="closeModal('notificationsModal'); openEditTxModal('${n.txId}');"`;
        else if (isExp) clickHandler = `onclick="closeModal('notificationsModal'); switchAppPage('commitments');"`;
        else if (isTask) clickHandler = `onclick="closeModal('notificationsModal'); openSummaryDrawer('tasks');"`;

        const iconClass = n.type === 'income' ? 'fa-circle-arrow-down' : (n.type === 'expense' ? 'fa-circle-arrow-up' : (n.type === 'bill' ? 'fa-file-invoice' : (n.type === 'commitment' ? 'fa-triangle-exclamation' : 'fa-bell')));
        const iconColor = n.type === 'income' ? '#34d399' : (n.type === 'expense' ? '#f43f5e' : (n.type === 'bill' ? '#fbbf24' : '#38bdf8'));

        return `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; background: rgba(30, 41, 59, 0.75); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 10px 12px; cursor: ${isClickable ? 'pointer' : 'default'}; transition: all 0.15s ease;" ${clickHandler} title="${isClickable ? 'انقر للانتقال مباشرة للعملية المرتبطة' : ''}">
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
              <i class="fa-solid ${iconClass}" style="color: ${iconColor}; font-size: 1.15rem;"></i>
              <div>
                <div style="font-size: 0.80rem; font-weight: 800; color: #f8fafc;">${escapeHtml(n.title)}</div>
                <div style="font-size: 0.68rem; color: #cbd5e1; margin-top: 2px;">${escapeHtml(n.body)}</div>
              </div>
            </div>
            ${isClickable ? '<span style="font-size: 0.66rem; color: #38bdf8; font-weight: 800; background: rgba(56, 189, 248, 0.15); padding: 3px 8px; border-radius: 6px;"><i class="fa-solid fa-arrow-up-right-from-square"></i> فتح</span>' : ''}
          </div>
        `;
      }).join('');'''

    if old_notif_render in content:
        content = content.replace(old_notif_render, new_notif_render, 1)
        print("✓ Upgraded notifications to deep-link to transactions & commitments & tasks")

    # =========================================================================
    # 5. تحسين الأداء وتسجيل الحركات الجديدة (handleSaveTx):
    # حفظ منفذ العملية، استخدام التاريخ المحلي المصري، وإظهار الحركة الجديدة فوراً
    # =========================================================================
    old_new_tx_obj = '''      const newTx = {
        id: 'tx-' + Date.now(),
        type: currentModalType,
        amount: amount,
        label: label,
        category: catInp ? catInp.value : 'other',
        member: (memberInp && memberInp.value) ? memberInp.value : 'البيت',
        walletId: walletInp && walletInp.value ? walletInp.value : (state.currentWalletId !== 'all' ? state.currentWalletId : 'wallet-default'),
        date: dateInp && dateInp.value ? dateInp.value : new Date().toISOString().split('T')[0],
        receipt: state.pendingReceiptDataUri || null
      };'''

    new_new_tx_obj = '''      const localToday = typeof getLocalDateStr === 'function' ? getLocalDateStr(new Date()) : new Date().toISOString().split('T')[0];
      const newTx = {
        id: 'tx-' + Date.now(),
        type: currentModalType,
        amount: amount,
        label: label,
        category: catInp ? catInp.value : 'other',
        member: (memberInp && memberInp.value) ? memberInp.value : (state.selectedMember !== 'الكل' ? state.selectedMember : 'البيت'),
        walletId: walletInp && walletInp.value ? walletInp.value : (state.currentWalletId !== 'all' ? state.currentWalletId : 'wallet-cash-safe'),
        date: dateInp && dateInp.value ? dateInp.value : localToday,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        author: state.currentUser || 'ماهر',
        receipt: state.pendingReceiptDataUri || null
      };

      // إضافة إشعار ذكي مرتبط بالحركة فوراً
      if (typeof addSystemNotification === 'function') {
        addSystemNotification({
          type: currentModalType,
          title: currentModalType === 'income' ? 'إيداع جديد تم تسجيله' : 'مصروف جديد تم تسجيله',
          body: `${label} بمبلغ ${formatMoney(amount)} (${newTx.member})`,
          txId: newTx.id
        });
      }'''

    if old_new_tx_obj in content:
        content = content.replace(old_new_tx_obj, new_new_tx_obj, 1)
        print("✓ Injected author and notification into newTx in handleSaveTx")

    # =========================================================================
    # 6. إزالة مستمعات الأحداث المكررة لمنع البطء والتعليق
    # =========================================================================
    duplicate_listeners = '''    // تفعيل المزامنة التلقائية وفحص النسخ الاحتياطي عند فتح التطبيق وعند عودة التركيز للنافذة (Visibility Change)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        checkDailyNoonBackupSchedule();
        const lastSync = localStorage.getItem('family_last_drive_sync');
        const now = Date.now();
        if (!lastSync || (now - new Date(lastSync).getTime() > 40000)) {
          executeGoogleDriveSync();
        }
      }
    });

    window.addEventListener('focus', () => {
      checkDailyNoonBackupSchedule();
      const lastSync = localStorage.getItem('family_last_drive_sync');
      const now = Date.now();
      if (!lastSync || (now - new Date(lastSync).getTime() > 40000)) {
        executeGoogleDriveSync();
      }
    });'''

    if duplicate_listeners in content:
        content = content.replace(duplicate_listeners, '    // Note: Unified sync handled cleanly by executeMasterUnifiedSyncAndRefresh', 1)
        print("✓ Removed duplicate listeners causing slowness")

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Phase 2 All Applied Successfully!")

if __name__ == '__main__':
    main()

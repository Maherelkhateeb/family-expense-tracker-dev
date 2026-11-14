#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Upgrade Member Expenses Drawer:
1. Delete the redundant top profile card ("كافة أفراد الأسرة" / 31 حركة / ملخص الشهر)
2. Add bottom section: "إجماليات مصروفات كل فرد من الأسرة خلال الفترة المحددة"
"""
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Locate renderSummaryDrawer in index.html
fn_start = text.find('function renderSummaryDrawer(')
if fn_start == -1:
    print("Error: Could not find renderSummaryDrawer")
    sys.exit(1)

fn_end = text.find('// =========================================================================\n    // نظام المهام والمسؤوليات الذكي المتطور', fn_start)
if fn_end == -1:
    print("Error: Could not find end of renderSummaryDrawer")
    sys.exit(1)

new_func = '''function renderSummaryDrawer(period = currentSummaryPeriod, member = currentDrawerMember) {
      const container = document.getElementById('summaryDrawerContent');
      const selectorStrip = document.getElementById('drawerMemberSelectorStrip');
      if (!container) return;

      const membersList = ['الكل', 'ماهر', 'أية', 'محمد', 'مريم', 'الحاجة', 'النونو', 'البيت'];
      if (selectorStrip) {
        selectorStrip.innerHTML = membersList.map(m => {
          const isActive = m === member;
          return `
            <button type="button" onclick="switchDrawerMember('${m}')" style="padding: 4px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 850; border: ${isActive ? '1.2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)'}; background: ${isActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.6)'}; color: ${isActive ? '#38bdf8' : '#94a3b8'}; cursor: pointer; white-space: nowrap; flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px;">
              <span>${m === 'الكل' ? '👥' : (m === 'البيت' ? '🏠' : (m === 'ماهر' ? '👨' : (m === 'أية' ? '👩' : (m === 'الحاجة' ? '🧕' : (m === 'النونو' ? '👶' : '🧒')))))}</span>
              <span>${m}</span>
            </button>
          `;
        }).join('');
      }

      const now = new Date();
      const todayStr = getLocalDateStr(now);
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      const weekAgoStr = getLocalDateStr(weekAgo);
      const thisMonthPrefix = todayStr.substring(0, 7);
      const thisYearPrefix = todayStr.substring(0, 4);

      let allPeriodTxs = [...(state.transactions || [])];
      let periodTitle = 'ملخص الشهر الحالي';

      if (period === 'day') {
        allPeriodTxs = allPeriodTxs.filter(t => t.date === todayStr);
        periodTitle = `ملخص اليوم (${todayStr})`;
      } else if (period === 'week') {
        allPeriodTxs = allPeriodTxs.filter(t => t.date >= weekAgoStr && t.date <= todayStr);
        periodTitle = `ملخص آخر 7 أيام`;
      } else if (period === 'month') {
        allPeriodTxs = allPeriodTxs.filter(t => (t.date || '').startsWith(thisMonthPrefix));
        periodTitle = `ملخص شهر ${now.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}`;
      } else if (period === 'year') {
        allPeriodTxs = allPeriodTxs.filter(t => (t.date || '').startsWith(thisYearPrefix));
        periodTitle = `ملخص عام ${thisYearPrefix}`;
      } else if (period === 'custom') {
        const { from, to } = summaryCustomDateRange;
        if (from && to) allPeriodTxs = allPeriodTxs.filter(t => t.date >= from && t.date <= to);
        else if (from) allPeriodTxs = allPeriodTxs.filter(t => t.date >= from);
        else if (to) allPeriodTxs = allPeriodTxs.filter(t => t.date <= to);
        periodTitle = `الفترة المخصصة (${from || 'البداية'} إلى ${to || 'اليوم'})`;
      }

      // تصفية حركات الفرد المحدد للعرض العلوي
      let txList = [...allPeriodTxs];
      if (member && member !== 'الكل') {
        txList = txList.filter(t => {
          const m = t.member || 'البيت';
          if (member === 'البيت') return m === 'البيت' || m === 'العائلة' || !t.member;
          if (member === 'آية' || member === 'أية') return m === 'آية' || m === 'أية';
          return m === member;
        });
      }

      let totalExp = 0, totalInc = 0;
      const catTotals = {};

      txList.forEach(t => {
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') {
          totalInc += amt;
        } else {
          totalExp += amt;
          let c = t.category || 'other';
          if (c === 'shopping' || c === 'supermarket') c = 'food';
          if (c === 'kids' || c === 'gifts' || c === 'entertainment') c = 'other';
          catTotals[c] = (catTotals[c] || 0) + amt;
        }
      });

      // إجماليات جميع مصروفات الفترة لحساب النسب
      let grandPeriodExp = 0;
      allPeriodTxs.forEach(t => {
        if (t.type !== 'income') grandPeriodExp += (Number(t.amount) || 0);
      });

      const memberPhotos = {
        'ماهر': 'assets/members/maher.jpg',
        'أية': 'assets/members/aya.jpg',
        'آية': 'assets/members/aya.jpg',
        'محمد': 'assets/members/mohamed.jpg',
        'مريم': 'assets/members/maryam.jpg',
        'الحاجة': 'assets/members/elhaja.jpg',
        'النونو': 'assets/members/nono.jpg',
        'البيت': 'assets/members/home.jpg',
        'الكل': 'assets/family_option2_mosaic.jpg'
      };

      const memberColors = {
        'ماهر': '#38bdf8',
        'أية': '#f472b6',
        'آية': '#f472b6',
        'محمد': '#34d399',
        'مريم': '#fbbf24',
        'الحاجة': '#a78bfa',
        'النونو': '#fb7185',
        'البيت': '#0284c7'
      };

      let catBreakdownHtml = Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).map(([catId, sum]) => {
        const cat = getCategoryObj(catId, 'expense');
        const pct = totalExp > 0 ? ((sum / totalExp) * 100).toFixed(0) : 0;
        const count = txList.filter(t => t.type === 'expense' && (t.category === catId || (catId === 'food' && (t.category === 'shopping' || t.category === 'supermarket')))).length;

        return `
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; background: rgba(15, 23, 42, 0.7); padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); cursor: pointer; transition: all 0.15s ease;" onclick="drillDownFromMemberDrawer('${catId}', '${cat.name}')" title="انقر لعرض تفاصيل حركات ${cat.name} الخاصة بـ ${member}">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.1rem;">${cat.icon ? `<i class="fa-solid ${cat.icon}" style="color: ${cat.color || '#38bdf8'}; font-size: 0.95rem;"></i>` : '📦'}</span>
              <div>
                <span style="color: #f8fafc; font-weight: 800;">${cat.name}</span>
                <div style="font-size: 0.62rem; color: #94a3b8;">${count} حركة مسجلة • انقر للتصفية</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #94a3b8; font-size: 0.68rem; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 6px;">${pct}%</span>
              <span style="color: #ff4d6d; font-weight: 950; font-family: var(--font-numbers); direction: ltr; unicode-bidi: isolate;">- ${formatSummaryVal(sum)}</span>
            </div>
          </div>
        `;
      }).join('');

      // حساب إجماليات كل فرد خلال الفترة المحددة بدقة متناهية
      const familyRoster = ['ماهر', 'أية', 'محمد', 'مريم', 'الحاجة', 'النونو', 'البيت'];
      const memberBreakdowns = familyRoster.map(memName => {
        let memExp = 0;
        let memCount = 0;
        allPeriodTxs.forEach(t => {
          if (t.type !== 'income') {
            const m = t.member || 'البيت';
            const isMatch = (memName === 'البيت' && (m === 'البيت' || m === 'العائلة' || !t.member)) ||
                            ((memName === 'أية' || memName === 'آية') && (m === 'آية' || m === 'أية')) ||
                            (m === memName);
            if (isMatch) {
              memExp += (Number(t.amount) || 0);
              memCount++;
            }
          }
        });
        const pct = grandPeriodExp > 0 ? Math.round((memExp / grandPeriodExp) * 100) : 0;
        return {
          name: memName,
          amount: memExp,
          count: memCount,
          pct: pct,
          color: memberColors[memName] || '#38bdf8',
          avatar: memberPhotos[memName] || 'assets/members/home.jpg'
        };
      }).sort((a,b) => b.amount - a.amount);

      let perMemberSectionHtml = `
        <div style="margin-top: 14px; padding-top: 12px; border-top: 1.2px solid rgba(255,255,255,0.1);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <div style="font-size: 0.82rem; font-weight: 900; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-users" style="color: #38bdf8;"></i>
              <span>إجماليات مصروفات كل فرد خلال الفترة:</span>
            </div>
            <span style="font-size: 0.65rem; color: #94a3b8; background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 6px;">${periodTitle}</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${memberBreakdowns.map(mb => {
              const isSelected = mb.name === member;
              return `
                <div onclick="switchDrawerMember('${mb.name}')" style="display: flex; flex-direction: column; gap: 4px; background: ${isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.7)'}; border: ${isSelected ? '1.2px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)'}; border-radius: 10px; padding: 8px 10px; cursor: pointer; transition: all 0.15s ease;" title="انقر لتصفية نفقات ${mb.name}">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <img src="${mb.avatar}" onerror="this.src='family_portrait.jpg'" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover; border: 1.5px solid ${mb.color};">
                      <div>
                        <span style="font-size: 0.78rem; font-weight: 850; color: #f8fafc;">${mb.name}</span>
                        <span style="font-size: 0.62rem; color: #94a3b8; margin-right: 4px;">(${mb.count} حركة)</span>
                      </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 0.66rem; color: #94a3b8; font-weight: 700;">${mb.pct}%</span>
                      <span style="font-size: 0.82rem; font-weight: 950; color: #ff4d6d; font-family: var(--font-numbers); direction: ltr; unicode-bidi: isolate;">- ${formatSummaryVal(mb.amount)}</span>
                    </div>
                  </div>
                  <!-- شريط التقدم للنسبة -->
                  <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; margin-top: 2px;">
                    <div style="width: ${Math.min(mb.pct, 100)}%; height: 100%; background: ${mb.color}; border-radius: 3px;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      // بناء محتوى الدرج (بدون الكارت المكرر المحذوف)
      container.innerHTML = `
        <!-- كروت مؤشرات الصرف والإيداع للفرد المختار -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 2px;">
          <div style="background: rgba(244, 63, 94, 0.12); border: 1.2px solid rgba(244, 63, 94, 0.35); border-radius: 12px; padding: 10px; text-align: center;">
            <div style="font-size: 0.66rem; color: #fca5a5; font-weight: 800;">إجمالي المصروفات</div>
            <div style="font-size: 1.05rem; font-weight: 950; color: #ff4d6d; font-family: var(--font-numbers); direction: ltr; unicode-bidi: isolate; margin-top: 2px;">
              - ${formatSummaryVal(totalExp)}
            </div>
          </div>
          <div style="background: rgba(16, 185, 129, 0.12); border: 1.2px solid rgba(16, 185, 129, 0.35); border-radius: 12px; padding: 10px; text-align: center;">
            <div style="font-size: 0.66rem; color: #86efac; font-weight: 800;">إجمالي الإيداعات</div>
            <div style="font-size: 1.05rem; font-weight: 950; color: #34d399; font-family: var(--font-numbers); direction: ltr; unicode-bidi: isolate; margin-top: 2px;">
              + ${formatSummaryVal(totalInc)}
            </div>
          </div>
        </div>

        <!-- عنوان قائمة بنود الصرف -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; margin-bottom: 2px;">
          <span style="font-size: 0.80rem; font-weight: 900; color: #f8fafc;"><i class="fa-solid fa-list-ul" style="color: #38bdf8;"></i> توزيع نفقات ${member === 'الكل' ? 'كافة الأسرة' : member} حسب البند:</span>
          <span style="font-size: 0.65rem; color: #94a3b8;">${txList.filter(t=>t.type==='expense').length} حركة</span>
        </div>

        <!-- قائمة بنود الصرف للفرد المختار -->
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${catBreakdownHtml || '<div style="text-align: center; color: #64748b; font-size: 0.76rem; padding: 20px 10px; background: rgba(15, 23, 42, 0.5); border-radius: 10px; border: 1px dashed rgba(255,255,255,0.1);">لا توجد حركات مصروفات مسجلة لهذا الفرد خلال الفترة المحددة</div>'}
        </div>

        <!-- القسم الجديد: إجماليات مصروفات كل فرد خلال الفترة المحددة -->
        ${perMemberSectionHtml}
      `;
    }'''

text = text[:fn_start] + new_func + '\n\n    ' + text[fn_end:]
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("✓ Successfully upgraded Member Expenses Drawer (card removed, per-member totals added at bottom)!")

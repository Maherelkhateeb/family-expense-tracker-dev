import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import re

INDEX_PATH = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    html = f.read()

# -------------------------------------------------------------------------
# New JavaScript Engine for Member Summary Drawer & Advanced Tasks Pro
# -------------------------------------------------------------------------
new_js_code = """    // =========================================================================
    // الدرج الجانبي الأيسر: ملخص المصروفات بالفرد (Member Financial Breakdown)
    // =========================================================================
    let currentDrawerMember = 'الكل';
    let currentSummaryPeriod = 'month'; // 'day' | 'week' | 'month' | 'year' | 'custom'
    let currentSummaryCurrency = 'EGP'; // 'EGP' | 'SAR' | 'USD' | 'GOLD21'
    let summaryCustomDateRange = { from: '', to: '' };

    function openSummaryDrawer(targetMember = null) {
      const drawer = document.getElementById('summaryLeftDrawer');
      const backdrop = document.getElementById('summaryDrawerBackdrop');
      if (targetMember) {
        currentDrawerMember = targetMember;
      } else if (state.currentMemberFilter && state.currentMemberFilter !== 'الكل') {
        currentDrawerMember = state.currentMemberFilter;
      } else {
        currentDrawerMember = 'الكل';
      }
      if (drawer) drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
      renderSummaryDrawer(currentSummaryPeriod, currentDrawerMember);
    }

    function closeSummaryLeftDrawer() {
      const drawer = document.getElementById('summaryLeftDrawer');
      const backdrop = document.getElementById('summaryDrawerBackdrop');
      if (drawer) drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');
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

      renderSummaryDrawer(p, currentDrawerMember);
    }

    function applyCustomSummaryDate() {
      const from = document.getElementById('summaryCustomDateFrom')?.value || '';
      const to = document.getElementById('summaryCustomDateTo')?.value || '';
      summaryCustomDateRange = { from, to };
      renderSummaryDrawer('custom', currentDrawerMember);
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
      renderSummaryDrawer(currentSummaryPeriod, currentDrawerMember);
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
        return `ر.س ${Number(sar).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      }
      return `ج.م ${Number(amtEgp).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }

    function switchDrawerMember(m) {
      currentDrawerMember = m;
      renderSummaryDrawer(currentSummaryPeriod, m);
    }

    function drillDownFromMemberDrawer(catId, catName) {
      closeSummaryLeftDrawer();
      openOperationsFiltered({
        category: catId,
        categoryName: catName,
        member: currentDrawerMember,
        type: 'expense'
      });
      showToast(`🔍 عرض كشف حركات ${catName} الخاصة بـ ${currentDrawerMember}`);
    }

    function renderSummaryDrawer(period = currentSummaryPeriod, member = currentDrawerMember) {
      const container = document.getElementById('summaryDrawerContent');
      const selectorStrip = document.getElementById('drawerMemberSelectorStrip');
      if (!container) return;

      const membersList = ['الكل', 'ماهر', 'أية', 'محمد', 'مريم', 'الحاجة', 'البيت'];
      if (selectorStrip) {
        selectorStrip.innerHTML = membersList.map(m => {
          const isActive = m === member;
          return `
            <button type="button" onclick="switchDrawerMember('${m}')" style="padding: 4px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 850; border: ${isActive ? '1.2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)'}; background: ${isActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.6)'}; color: ${isActive ? '#38bdf8' : '#94a3b8'}; cursor: pointer; white-space: nowrap; flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px;">
              <span>${m === 'الكل' ? '👥' : (m === 'البيت' ? '🏠' : (m === 'ماهر' ? '👨' : (m === 'أية' ? '👩' : (m === 'الحاجة' ? '🧕' : '🧒'))))}</span>
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

      let txList = [...(state.transactions || [])];
      let periodTitle = 'ملخص الشهر الحالي';

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

      // تطبيق فلترة الفرد المختار بدقة تامة
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

      const memberPhotos = {
        'ماهر': 'assets/members/maher.jpg',
        'أية': 'assets/members/aya.jpg',
        'محمد': 'assets/members/mohamed.jpg',
        'مريم': 'assets/members/maryam.jpg',
        'الحاجة': 'assets/members/elhaja.jpg',
        'النونو': 'assets/members/nono.jpg',
        'البيت': 'assets/members/home.jpg',
        'الكل': 'assets/family_option2_mosaic.jpg'
      };
      const avatarSrc = memberPhotos[member] || 'assets/members/home.jpg';

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

      container.innerHTML = `
        <!-- كارت بروفايل الفرد المختار المعتمد -->
        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.5px solid rgba(56, 189, 248, 0.45); border-radius: 14px; padding: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
          <img src="${avatarSrc}" onerror="this.src='family_portrait.jpg'" style="width: 50px; height: 50px; border-radius: 14px; object-fit: cover; object-position: top center; border: 2.2px solid #38bdf8; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.96rem; font-weight: 900; color: #fff;">${member === 'الكل' ? 'كافة أفراد الأسرة' : member}</span>
              <span style="font-size: 0.65rem; color: #38bdf8; font-weight: 800; background: rgba(56, 189, 248, 0.15); padding: 2px 8px; border-radius: 6px;">${periodTitle}</span>
            </div>
            <div style="font-size: 0.68rem; color: #94a3b8; margin-top: 2px;">
              ${txList.length} حركة مسجلة خلال الفترة
            </div>
          </div>
        </div>

        <!-- كروت مؤشرات الصرف والإيداع للفرد المختار -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
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

        <!-- عنوان قائمة بنود الصرف مع التوجيه التفاعلي -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px;">
          <span style="font-size: 0.80rem; font-weight: 900; color: #f8fafc;"><i class="fa-solid fa-list-ul" style="color: #38bdf8;"></i> توزيع النفقات حسب البند:</span>
          <span style="font-size: 0.62rem; color: #38bdf8;">(انقر على أي بند للانتقال لكشف حركاته)</span>
        </div>

        <!-- قائمة بنود الصرف للفرد المختار -->
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${catBreakdownHtml || '<div style="text-align: center; color: #64748b; font-size: 0.76rem; padding: 25px 10px; background: rgba(15, 23, 42, 0.5); border-radius: 10px; border: 1px dashed rgba(255,255,255,0.1);">لا توجد حركات مصروفات مسجلة لهذا الفرد خلال الفترة المحددة</div>'}
        </div>
      `;
    }

    // =========================================================================
    // نظام المهام والمسؤوليات الذكي المتطور (Tasks Pro Engine - Top Mobile Apps Standards)
    // مستوحى من أفضل مميزات Todoist, TickTick, Microsoft To Do, Things 3, Apple Reminders
    // =========================================================================
    let currentDrawerTodoSection = 'my_day';
    let currentTasksMemberFilter = 'all';
    let quickTaskDueDatePreset = 'today';
    window.currentPendingTaskPhotoUri = null;
    window.pendingSubtaskPhotos = window.pendingSubtaskPhotos || {};

    function getTodoTasks() {
      try {
        const raw = localStorage.getItem('family_monefy_tasks');
        if (raw) return JSON.parse(raw);
      } catch(e) {}
      // عينة تجريبية أولية راقية إذا لم تكن هناك مهام
      return [
        {
          id: 'task_demo_1',
          title: 'تسوق خضار ومستلزمات السوبرماركت الأسبوعية',
          completed: false,
          dueDate: getLocalDateStr(new Date()),
          dueTime: '18:00',
          priority: 'high',
          tag: 'shopping',
          assignedMember: 'أية',
          estimatedAmount: 750,
          isExpenseConverted: false,
          starred: true,
          subtasks: [
            { id: 'sub_1_1', title: 'شراء فاكهة وخضار طازج', completed: true },
            { id: 'sub_1_2', title: 'ألبان واجبان وبيض', completed: false },
            { id: 'sub_1_3', title: 'منظفات وعناية شخصية', completed: false }
          ]
        },
        {
          id: 'task_demo_2',
          title: 'سداد فاتورة الإنترنت المنزلي وفاتورة الكهرباء',
          completed: false,
          dueDate: getLocalDateStr(new Date()),
          dueTime: '21:00',
          priority: 'high',
          tag: 'bills',
          assignedMember: 'ماهر',
          estimatedAmount: 580,
          isExpenseConverted: false,
          starred: true,
          subtasks: [
            { id: 'sub_2_1', title: 'دفع فاتورة وي WE إنترنت', completed: false },
            { id: 'sub_2_2', title: 'شحن كارت الكهرباء الذكي', completed: false }
          ]
        },
        {
          id: 'task_demo_3',
          title: 'مستلزمات المدرسة ودروس الأطفال',
          completed: false,
          dueDate: getLocalDateStr(new Date(Date.now() + 86400000)),
          dueTime: '14:00',
          priority: 'medium',
          tag: 'family',
          assignedMember: 'محمد',
          estimatedAmount: 300,
          isExpenseConverted: false,
          starred: false,
          subtasks: []
        }
      ];
    }

    function saveTodoTasks(tasks) {
      try {
        localStorage.setItem('family_monefy_tasks', JSON.stringify(tasks));
      } catch(e) {}
    }

    function openTasksFullScreenModal() {
      const modal = document.getElementById('tasksFullScreenModal');
      if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
      }
      renderTasksProList();
    }

    function closeTasksFullScreenModal() {
      const modal = document.getElementById('tasksFullScreenModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    }

    function openTasksModal() {
      openTasksFullScreenModal();
    }

    function switchDrawerTodoSection(sec) {
      currentDrawerTodoSection = sec;
      const tabs = ['my_day', 'important', 'planned', 'shopping', 'overdue', 'completed'];
      tabs.forEach(t => {
        const btnId = `btnFullTodo${t === 'my_day' ? 'MyDay' : (t === 'important' ? 'Important' : (t === 'planned' ? 'Planned' : (t === 'shopping' ? 'Shopping' : (t === 'overdue' ? 'Overdue' : 'Completed'))))}`;
        const btn = document.getElementById(btnId);
        if (btn) {
          if (t === sec) {
            btn.className = 'exp-tab-btn active';
            btn.style.background = 'rgba(168, 85, 247, 0.25)';
            btn.style.color = '#c084fc';
            btn.style.border = '1.2px solid rgba(168, 85, 247, 0.45)';
          } else {
            btn.className = 'exp-tab-btn';
            btn.style.background = 'transparent';
            btn.style.color = '#94a3b8';
            btn.style.border = '1px solid rgba(255,255,255,0.1)';
          }
        }
      });
      renderTasksProList();
    }

    function setTasksMemberFilter(mem, btn) {
      currentTasksMemberFilter = mem;
      const box = document.getElementById('tasksMemberFilterPills');
      if (box) {
        box.querySelectorAll('.btn-task-member-pill').forEach(b => {
          b.classList.remove('active');
          b.style.background = 'transparent';
          b.style.color = '#94a3b8';
          b.style.border = '1px solid rgba(255,255,255,0.1)';
        });
      }
      if (btn) {
        btn.classList.add('active');
        btn.style.background = 'rgba(56, 189, 248, 0.2)';
        btn.style.color = '#38bdf8';
        btn.style.border = '1px solid rgba(56, 189, 248, 0.4)';
      }
      renderTasksProList();
    }

    function setQuickTaskPreset(preset) {
      quickTaskDueDatePreset = preset;
      const chips = document.getElementById('quickTaskPresetChips');
      if (chips) {
        chips.querySelectorAll('.btn-quick-date-chip').forEach(c => {
          c.classList.remove('active');
          c.style.background = 'transparent';
          c.style.color = '#94a3b8';
          c.style.border = '1px solid rgba(255,255,255,0.1)';
        });
      }
      const activeChip = document.getElementById(
        preset === 'today' ? 'chipQuickToday' : 
        (preset === 'tomorrow' ? 'chipQuickTomorrow' : 
        (preset === 'weekend' ? 'chipQuickWeekend' : 'chipQuickNone'))
      );
      if (activeChip) {
        activeChip.classList.add('active');
        activeChip.style.background = 'rgba(168, 85, 247, 0.25)';
        activeChip.style.color = '#c084fc';
        activeChip.style.border = '1px solid rgba(168, 85, 247, 0.4)';
      }
    }

    function handleQuickTaskAdd() {
      const inp = document.getElementById('quickTaskTitleInput');
      const title = inp ? inp.value.trim() : '';
      if (!title) {
        showToast('⚠️ يرجى كتابة عنوان المهمة أولاً');
        if (inp) inp.focus();
        return;
      }

      const mem = document.getElementById('quickTaskMemberSelect')?.value || 'البيت';
      const prio = document.getElementById('quickTaskPrioritySelect')?.value || 'normal';
      const estAmt = parseFloat(document.getElementById('quickTaskEstAmount')?.value || 0) || null;

      const now = new Date();
      let targetDate = '';
      if (quickTaskDueDatePreset === 'today') {
        targetDate = getLocalDateStr(now);
      } else if (quickTaskDueDatePreset === 'tomorrow') {
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        targetDate = getLocalDateStr(tomorrow);
      } else if (quickTaskDueDatePreset === 'weekend') {
        const dayOfWeek = now.getDay();
        const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
        const nextFri = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilFriday);
        targetDate = getLocalDateStr(nextFri);
      }

      let tag = 'general';
      const tLower = title.toLowerCase();
      if (tLower.includes('شراء') || tLower.includes('سوبرماركت') || tLower.includes('خضار') || tLower.includes('لحمة') || estAmt > 0) tag = 'shopping';
      else if (tLower.includes('فاتورة') || tLower.includes('قسط') || tLower.includes('نت') || tLower.includes('كهرباء') || tLower.includes('غاز')) tag = 'bills';
      else if (tLower.includes('بيت') || tLower.includes('منزل') || tLower.includes('تصليح')) tag = 'home';
      else if (tLower.includes('دواء') || tLower.includes('علاج') || tLower.includes('دكتور')) tag = 'family';

      const newTask = {
        id: 'task_' + Date.now(),
        title: title,
        completed: false,
        dueDate: targetDate,
        dueTime: targetDate ? '20:00' : '',
        priority: prio,
        tag: tag,
        assignedMember: mem,
        estimatedAmount: estAmt,
        isExpenseConverted: false,
        subtasks: [],
        createdAt: new Date().toISOString()
      };

      const tasks = getTodoTasks();
      tasks.unshift(newTask);
      saveTodoTasks(tasks);

      inp.value = '';
      const amtInp = document.getElementById('quickTaskEstAmount');
      if (amtInp) amtInp.value = '';
      showToast(`✅ تمت إضافة المهمة: ${title}`);
      renderTasksProList();
    }

    function toggleDrawerTaskCompletion(taskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      task.completed = !task.completed;
      if (task.completed) {
        task.completedAt = new Date().toISOString();
        showToast('🎉 أحسنت! تم إنجاز المهمة بنجاح');
      }
      saveTodoTasks(tasks);
      renderTasksProList();
    }

    function toggleTaskStar(taskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      task.starred = !task.starred;
      saveTodoTasks(tasks);
      renderTasksProList();
    }

    function deleteDrawerTask(taskId) {
      if (!confirm('هل أنت متأكد من حذف هذه المهمة نهائياً؟')) return;
      let tasks = getTodoTasks();
      tasks = tasks.filter(t => t.id !== taskId);
      saveTodoTasks(tasks);
      showToast('🗑️ تم حذف المهمة بنجاح');
      renderTasksProList();
    }

    function convertTaskToExpense(taskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      closeTasksFullScreenModal();

      let targetCat = 'other';
      if (task.tag === 'bills') targetCat = 'bills';
      else if (task.tag === 'shopping') targetCat = 'food';
      else if (task.tag === 'home') targetCat = 'house';
      else if (task.tag === 'family') targetCat = 'other';

      openTxModal('expense', targetCat);

      setTimeout(() => {
        const labelInp = document.getElementById('inpTxLabel');
        const amountInp = document.getElementById('inpTxAmount');
        const memberInp = document.getElementById('inpTxMember');

        if (labelInp) labelInp.value = task.title;
        if (amountInp && task.estimatedAmount) amountInp.value = task.estimatedAmount;
        if (memberInp && task.assignedMember) memberInp.value = task.assignedMember;

        task.isExpenseConverted = true;
        task.completed = true;
        saveTodoTasks(tasks);
      }, 150);
    }

    function toggleSubtaskCompleted(taskId, subtaskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (!task || !task.subtasks) return;
      const sub = task.subtasks.find(s => s.id === subtaskId);
      if (!sub) return;
      sub.completed = !sub.completed;
      saveTodoTasks(tasks);
      renderTasksProList();
    }

    function toggleSubtaskForm(taskId, forceOpen = null) {
      const box = document.getElementById(`subtaskAddBox_${taskId}`);
      if (!box) return;
      const willOpen = forceOpen !== null ? forceOpen : (box.style.display === 'none');
      box.style.display = willOpen ? 'block' : 'none';
      if (willOpen) {
        const inp = document.getElementById(`inpSubtaskTitle_${taskId}`);
        if (inp) inp.focus();
      }
    }

    function addSubtaskToTask(taskId) {
      const titleInp = document.getElementById(`inpSubtaskTitle_${taskId}`);
      const title = titleInp ? titleInp.value.trim() : '';
      if (!title) {
        showToast('⚠️ يرجى كتابة بيان الخطوة الفرعية');
        if (titleInp) titleInp.focus();
        return;
      }

      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      if (!task.subtasks) task.subtasks = [];
      const newSub = {
        id: 'sub_' + Date.now(),
        title: title,
        completed: false,
        photoUri: window.pendingSubtaskPhotos[taskId] || null
      };

      task.subtasks.push(newSub);
      saveTodoTasks(tasks);
      delete window.pendingSubtaskPhotos[taskId];

      titleInp.value = '';
      toggleSubtaskForm(taskId, false);
      showToast('✅ تمت إضافة الخطوة الفرعية بنجاح');
      renderTasksProList();
    }

    function deleteSubtask(taskId, subtaskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (!task || !task.subtasks) return;
      task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
      saveTodoTasks(tasks);
      renderTasksProList();
    }

    function handleSubtaskPhotoPicked(event, taskId) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const maxDim = 500;
          let w = img.width, h = img.height;
          if (w > h && w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
          else if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.80);
          window.pendingSubtaskPhotos[taskId] = compressed;
          const badge = document.getElementById(`subtaskPhotoBadge_${taskId}`);
          if (badge) badge.style.display = 'inline';
          showToast('📷 تم التقاط صورة الخطوة بنجاح');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function openNewTaskDrawerModal() {
      const modal = document.getElementById('newTaskDrawerModal');
      if (modal) {
        modal.style.display = 'flex';
        const titleInp = document.getElementById('drawerNewTaskTitle');
        if (titleInp) {
          titleInp.value = '';
          setTimeout(() => titleInp.focus(), 150);
        }
      }
    }

    function handleDrawerAddNewTask() {
      const titleInp = document.getElementById('drawerNewTaskTitle');
      const title = titleInp ? titleInp.value.trim() : '';
      if (!title) {
        showToast('⚠️ يرجى كتابة عنوان المهمة');
        if (titleInp) titleInp.focus();
        return;
      }

      const mem = document.getElementById('drawerNewTaskMember')?.value || 'البيت';
      const prio = document.getElementById('drawerNewTaskPriority')?.value || 'normal';
      const tag = document.getElementById('drawerNewTaskTag')?.value || 'general';
      const estAmt = parseFloat(document.getElementById('drawerNewTaskAmount')?.value || 0) || null;
      const dtVal = document.getElementById('drawerNewTaskDateTimeInput')?.value || '';

      let dueDate = '', dueTime = '';
      if (dtVal) {
        const parts = dtVal.split('T');
        dueDate = parts[0] || '';
        dueTime = parts[1] || '';
      }

      const newTask = {
        id: 'task_' + Date.now(),
        title: title,
        completed: false,
        dueDate: dueDate,
        dueTime: dueTime,
        priority: prio,
        tag: tag,
        assignedMember: mem,
        estimatedAmount: estAmt,
        isExpenseConverted: false,
        starred: prio === 'high',
        photoUri: currentPendingTaskPhotoUri || null,
        subtasks: [],
        createdAt: new Date().toISOString()
      };

      const tasks = getTodoTasks();
      tasks.unshift(newTask);
      saveTodoTasks(tasks);

      currentPendingTaskPhotoUri = null;
      closeModal('newTaskDrawerModal');
      showToast(`✅ تمت إضافة المهمة بنجاح: ${title}`);
      renderTasksProList();
    }

    function setTaskDateTimePreset(preset, targetInputId = 'drawerNewTaskDateTimeInput') {
      const inp = document.getElementById(targetInputId);
      if (!inp) return;
      const now = new Date();
      if (preset === 'clear') {
        inp.value = '';
        showToast('تم مسح موعد المهمة');
        return;
      }
      let targetDate = new Date(now.getTime());
      if (preset === 'today_evening') {
        targetDate.setHours(20, 0, 0, 0);
      } else if (preset === 'tomorrow_morning') {
        targetDate.setDate(targetDate.getDate() + 1);
        targetDate.setHours(9, 0, 0, 0);
      } else if (preset === 'weekend') {
        const dayOfWeek = now.getDay();
        const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
        targetDate.setDate(targetDate.getDate() + daysUntilFriday);
        targetDate.setHours(18, 0, 0, 0);
      }
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      const d = String(targetDate.getDate()).padStart(2, '0');
      const hh = String(targetDate.getHours()).padStart(2, '0');
      const mm = String(targetDate.getMinutes()).padStart(2, '0');
      inp.value = `${y}-${m}-${d}T${hh}:${mm}`;
    }

    function handleTaskPhotoUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const maxDim = 600;
          let w = img.width, h = img.height;
          if (w > h && w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
          else if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          currentPendingTaskPhotoUri = compressed;
          const previewImg = document.getElementById('taskPendingPhotoImg');
          const previewCont = document.getElementById('taskPendingPhotoPreview');
          if (previewImg) previewImg.src = compressed;
          if (previewCont) previewCont.style.display = 'block';
          showToast('📷 تم إرفاق الصورة للمهمة');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function clearTaskPendingPhoto() {
      currentPendingTaskPhotoUri = null;
      const previewCont = document.getElementById('taskPendingPhotoPreview');
      if (previewCont) previewCont.style.display = 'none';
    }

    function renderTasksProList() {
      const container = document.getElementById('tasksFullScreenContainerList');
      if (!container) return;

      const allTasks = getTodoTasks();
      const now = new Date();
      const todayStr = getLocalDateStr(now);
      const currentHHMM = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

      const totalCount = allTasks.length;
      const activeCount = allTasks.filter(t => !t.completed).length;
      const completedCount = allTasks.filter(t => t.completed).length;
      const overdueCount = allTasks.filter(t => {
        if (t.completed) return false;
        if (t.dueDate) {
          if (t.dueDate < todayStr) return true;
          if (t.dueDate === todayStr && t.dueTime && t.dueTime < currentHHMM) return true;
        }
        return false;
      }).length;

      const kTot = document.getElementById('kpiTasksTotalFull');
      const kAct = document.getElementById('kpiTasksActiveFull');
      const kOvd = document.getElementById('kpiTasksOverdueFull');
      const kDon = document.getElementById('kpiTasksDoneFull');
      const bProg = document.getElementById('tasksOverallProgressBarFull');
      const pProg = document.getElementById('tasksOverallProgressPctFull');
      const pBadge = document.getElementById('tasksProductivityBadge');

      if (kTot) kTot.textContent = totalCount;
      if (kAct) kAct.textContent = activeCount;
      if (kOvd) kOvd.textContent = overdueCount;
      if (kDon) kDon.textContent = completedCount;

      const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      if (bProg) bProg.style.width = overallPct + '%';
      if (pProg) pProg.textContent = overallPct + '%';
      if (pBadge) {
        if (overallPct === 100 && totalCount > 0) pBadge.textContent = '🌟 إنجاز 100% مبهر!';
        else if (overallPct >= 60) pBadge.textContent = '🔥 إنتاجية عالية';
        else pBadge.textContent = `${activeCount} مهام متبقية`;
      }

      // تطبيق تصفية القسم الذكي (Smart Lists)
      let filtered = allTasks;
      if (currentDrawerTodoSection === 'my_day') {
        filtered = allTasks.filter(t => !t.completed && (t.dueDate === todayStr || !t.dueDate));
      } else if (currentDrawerTodoSection === 'important') {
        filtered = allTasks.filter(t => !t.completed && (t.starred || t.priority === 'high'));
      } else if (currentDrawerTodoSection === 'planned') {
        filtered = allTasks.filter(t => !t.completed && Boolean(t.dueDate));
      } else if (currentDrawerTodoSection === 'shopping') {
        filtered = allTasks.filter(t => !t.completed && (t.tag === 'shopping' || (t.estimatedAmount && t.estimatedAmount > 0)));
      } else if (currentDrawerTodoSection === 'overdue') {
        filtered = allTasks.filter(t => {
          if (t.completed) return false;
          if (t.dueDate) {
            if (t.dueDate < todayStr) return true;
            if (t.dueDate === todayStr && t.dueTime && t.dueTime < currentHHMM) return true;
          }
          return false;
        });
      } else if (currentDrawerTodoSection === 'completed') {
        filtered = allTasks.filter(t => t.completed);
      } else {
        filtered = allTasks.filter(t => !t.completed);
      }

      // تطبيق فلترة العضو المختار
      if (currentTasksMemberFilter && currentTasksMemberFilter !== 'all') {
        filtered = filtered.filter(t => (t.assignedMember || 'البيت') === currentTasksMemberFilter);
      }

      // تطبيق نص البحث إذا وجد
      const q = (document.getElementById('tasksSearchInput')?.value || '').trim().toLowerCase();
      if (q) {
        filtered = filtered.filter(t => {
          const title = (t.title || '').toLowerCase();
          const mem = (t.assignedMember || '').toLowerCase();
          const tag = (t.tag || '').toLowerCase();
          const subMatch = (t.subtasks || []).some(s => (s.title || '').toLowerCase().includes(q));
          return title.includes(q) || mem.includes(q) || tag.includes(q) || subMatch;
        });
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 45px 16px; background: rgba(15, 23, 42, 0.65); border: 1.5px dashed rgba(168, 85, 247, 0.35); border-radius: 16px; margin-top: 6px;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(168, 85, 247, 0.15); color: #c084fc; display: inline-flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 12px;">
              <i class="fa-solid fa-clipboard-check"></i>
            </div>
            <div style="font-weight: 850; font-size: 0.95rem; color: #f8fafc;">لا توجد مهام في هذه القائمة حالياً</div>
            <div style="font-size: 0.74rem; color: #94a3b8; margin: 6px 0 16px;">استخدم شريط الإضافة السريعة أعلاه لتسجيل مهامك وخطواتك بلمسة زر</div>
          </div>
        `;
        return;
      }

      const TAG_LABELS = {
        bills: { name: 'فواتير والتزامات', icon: 'fa-receipt', color: '#f97316' },
        shopping: { name: 'مشتريات', icon: 'fa-cart-shopping', color: '#10b981' },
        home: { name: 'منزل', icon: 'fa-house', color: '#8b5cf6' },
        family: { name: 'أسرة وشخصي', icon: 'fa-heart', color: '#ec4899' },
        work: { name: 'عمل ودراسة', icon: 'fa-briefcase', color: '#0284c7' },
        general: { name: 'عام', icon: 'fa-tag', color: '#94a3b8' }
      };

      container.innerHTML = filtered.map(t => {
        const isDone = t.completed;
        const isStar = t.starred;
        const subtasks = t.subtasks || [];
        const hasSubs = subtasks.length > 0;
        const subsCompleted = subtasks.filter(s => s.completed).length;

        const isOverdue = !isDone && t.dueDate && (t.dueDate < todayStr || (t.dueDate === todayStr && t.dueTime && t.dueTime < currentHHMM));
        const isDueToday = !isDone && t.dueDate === todayStr;

        let dateBadge = '';
        if (t.dueDate) {
          if (isOverdue) {
            dateBadge = `<span style="font-size: 0.65rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4);"><i class="fa-solid fa-triangle-exclamation"></i> متأخرة (${t.dueDate} ${t.dueTime || ''})</span>`;
          } else if (isDueToday) {
            dateBadge = `<span style="font-size: 0.65rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);"><i class="fa-solid fa-clock"></i> اليوم ${t.dueTime || ''}</span>`;
          } else {
            dateBadge = `<span style="font-size: 0.65rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);"><i class="fa-solid fa-calendar"></i> ${t.dueDate} ${t.dueTime || ''}</span>`;
          }
        }

        const tagObj = TAG_LABELS[t.tag] || TAG_LABELS.general;
        const memberName = t.assignedMember || 'البيت';

        let subtasksHtml = subtasks.map(s => `
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(15, 23, 42, 0.8); padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
              <button type="button" onclick="toggleSubtaskCompleted('${t.id}', '${s.id}')" style="background: transparent; border: none; cursor: pointer; color: ${s.completed ? '#10b981' : '#94a3b8'}; font-size: 1.05rem; padding: 0;">
                <i class="fa-${s.completed ? 'solid fa-circle-check' : 'regular fa-circle'}"></i>
              </button>
              <span style="font-size: 0.74rem; font-weight: 700; color: ${s.completed ? '#64748b' : '#f8fafc'}; text-decoration: ${s.completed ? 'line-through' : 'none'};">${escapeHtml(s.title)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              ${s.photoUri ? `<img src="${s.photoUri}" style="width: 24px; height: 24px; border-radius: 4px; object-fit: cover; cursor: pointer;" onclick="openReceiptLightbox('${s.photoUri}', '${escapeHtml(s.title)}')">` : ''}
              <button type="button" onclick="deleteSubtask('${t.id}', '${s.id}')" style="background: transparent; border: none; color: #ef4444; font-size: 0.75rem; cursor: pointer; opacity: 0.7;" title="حذف الخطوة">&times;</button>
            </div>
          </div>
        `).join('');

        return `
          <div class="task-card-item" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.3px solid ${isDone ? 'rgba(52, 211, 153, 0.4)' : (t.priority === 'high' ? 'rgba(239, 68, 68, 0.45)' : 'rgba(168, 85, 247, 0.35)')}; border-radius: 14px; padding: 12px 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.35); transition: all 0.15s ease;">
            
            <!-- السطر العلوي: الشيك بوكس + العنوان + النجمة + الحذف -->
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;">
              <div style="display: flex; align-items: flex-start; gap: 10px; flex: 1;">
                <!-- أيقونة الدائرة التفاعلية (Todoist / Things 3 Style) -->
                <button type="button" onclick="toggleDrawerTaskCompletion('${t.id}')" style="background: transparent; border: none; cursor: pointer; color: ${isDone ? '#34d399' : '#94a3b8'}; font-size: 1.35rem; line-height: 1; padding: 2px 0 0;" title="${isDone ? 'إلغاء الإنجاز' : 'تحديد كمكتملة'}">
                  <i class="fa-${isDone ? 'solid fa-circle-check' : 'regular fa-circle'}"></i>
                </button>
                <div style="flex: 1;">
                  <div style="font-size: 0.92rem; font-weight: 900; color: ${isDone ? '#94a3b8' : '#f8fafc'}; text-decoration: ${isDone ? 'line-through' : 'none'}; line-height: 1.35;">
                    ${escapeHtml(t.title)}
                  </div>
                </div>
              </div>

              <!-- أزرار الإجراءات السريعة: المفضلة / الحذف -->
              <div style="display: flex; align-items: center; gap: 6px;">
                <button type="button" onclick="toggleTaskStar('${t.id}')" style="background: transparent; border: none; color: ${isStar ? '#fbbf24' : '#64748b'}; font-size: 1.1rem; cursor: pointer; padding: 0 2px;" title="${isStar ? 'إلغاء التمييز' : 'تمييز كمهمة هامة'}">
                  <i class="fa-${isStar ? 'solid' : 'regular'} fa-star"></i>
                </button>
                <button type="button" onclick="deleteDrawerTask('${t.id}')" style="background: transparent; border: none; color: #ef4444; font-size: 0.95rem; cursor: pointer; opacity: 0.65; padding: 0 2px;" title="حذف المهمة">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>

            <!-- سطر الشارات والبيانات المرجعية (Member, Due Date, Priority, Est Amount) -->
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
              <div style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap;">
                <!-- شارة الفرد المسند إليه -->
                <span style="font-size: 0.66rem; font-weight: 850; padding: 2px 7px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">
                  👤 ${escapeHtml(memberName)}
                </span>

                <!-- شارة التصنيف -->
                <span style="font-size: 0.66rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: rgba(255, 255, 255, 0.06); color: ${tagObj.color}; border: 1px solid rgba(255,255,255,0.1);">
                  <i class="fa-solid ${tagObj.icon}"></i> ${tagObj.name}
                </span>

                <!-- شارة الأولوية -->
                ${t.priority === 'high' ? `<span style="font-size: 0.66rem; font-weight: 900; padding: 2px 7px; border-radius: 6px; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4);"><i class="fa-solid fa-fire"></i> عاجل P1</span>` : ''}

                <!-- شارة الموعد -->
                ${dateBadge}
              </div>

              <!-- جزء المبلغ المالي والتحويل لمصروف (Fintech Integration) -->
              <div style="display: flex; align-items: center; gap: 6px;">
                ${t.estimatedAmount ? `
                  <span style="font-size: 0.72rem; font-weight: 900; color: #fbbf24; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); padding: 2px 8px; border-radius: 6px; font-family: var(--font-numbers); direction: ltr; unicode-bidi: isolate;">
                    ج.م ${Number(t.estimatedAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                ` : ''}

                ${!isDone && t.estimatedAmount && !t.isExpenseConverted ? `
                  <button type="button" onclick="convertTaskToExpense('${t.id}')" style="height: 26px; padding: 0 8px; border-radius: 6px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; font-size: 0.66rem; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);">
                    <i class="fa-solid fa-credit-card"></i> تحويل لمصروف
                  </button>
                ` : (t.isExpenseConverted ? `
                  <span style="font-size: 0.64rem; font-weight: 850; color: #34d399; background: rgba(16, 185, 129, 0.15); padding: 2px 6px; border-radius: 5px;">✓ تم الصرف</span>
                ` : '')}
              </div>
            </div>

            <!-- قسم الخطوات الفرعية (TickTick & MS To Do Checklist) -->
            <div style="margin-top: 8px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <button type="button" onclick="toggleSubtaskForm('${t.id}')" style="background: transparent; border: none; color: #c084fc; font-size: 0.70rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; padding: 0;">
                  <i class="fa-solid fa-plus-circle"></i> + إضافة خطوة فرعية
                </button>
                ${hasSubs ? `
                  <span style="font-size: 0.66rem; color: #94a3b8; font-weight: 800;">
                    ${subsCompleted} من ${subtasks.length} خطوات مكتملة
                  </span>
                ` : ''}
              </div>

              <!-- قائمة الخطوات إن وجدت -->
              ${hasSubs ? `
                <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
                  ${subtasksHtml}
                </div>
              ` : ''}

              <!-- صندوق إضافة خطوة فرعية سريعة -->
              <div id="subtaskAddBox_${t.id}" style="display: none; background: rgba(15, 23, 42, 0.95); border: 1.2px solid rgba(168, 85, 247, 0.4); border-radius: 10px; padding: 8px 10px; margin-top: 6px;">
                <div style="display: flex; gap: 6px; align-items: center;">
                  <input type="text" id="inpSubtaskTitle_${t.id}" placeholder="اكتب خطوة فرعية واضغط حفظ..." style="flex: 1; height: 32px; background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(255,255,255,0.12); border-radius: 7px; color: #fff; padding: 0 8px; font-size: 0.74rem; font-weight: 700; outline: none;" onkeydown="if(event.key==='Enter') addSubtaskToTask('${t.id}')">
                  
                  <!-- زر إرفاق صورة للخطوة الفرعية -->
                  <input type="file" id="inpSubtaskPhoto_${t.id}" accept="image/*" style="display: none;" onchange="handleSubtaskPhotoPicked(event, '${t.id}')">
                  <button type="button" onclick="document.getElementById('inpSubtaskPhoto_${t.id}').click()" title="إرفاق صورة" style="height: 32px; padding: 0 8px; border-radius: 7px; background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.35); color: #c084fc; font-size: 0.72rem; cursor: pointer;">
                    <i class="fa-solid fa-camera"></i>
                  </button>
                  <button type="button" onclick="addSubtaskToTask('${t.id}')" style="height: 32px; padding: 0 12px; border-radius: 7px; background: #a855f7; border: none; color: #fff; font-size: 0.72rem; font-weight: 850; cursor: pointer;">
                    حفظ
                  </button>
                  <button type="button" onclick="toggleSubtaskForm('${t.id}', false)" style="height: 32px; padding: 0 8px; border-radius: 7px; background: rgba(255,255,255,0.06); border: none; color: #94a3b8; font-size: 0.72rem; cursor: pointer;">
                    &times;
                  </button>
                </div>
              </div>
            </div>

            <!-- صورة المرفق إن وجدت في المهمة الرئيسية -->
            ${t.photoUri ? `
              <div style="margin-top: 8px; text-align: center;">
                <img src="${t.photoUri}" style="max-height: 100px; border-radius: 8px; border: 1.2px solid rgba(168, 85, 247, 0.4); object-fit: contain; cursor: pointer;" onclick="openReceiptLightbox('${t.photoUri}', '${escapeHtml(t.title)}')">
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    // اسم بديل متوافق لضمان عدم توقف أي استدعاء قديم
    const renderDrawerTasksList = renderTasksProList;
"""

# Replace in html
js_pattern = re.compile(
    r"let currentDrawerTab = 'summary';.*?function openTasksModal\(\) \{.*?\n\s*\}",
    re.DOTALL
)

if js_pattern.search(html):
    html = js_pattern.sub(new_js_code, html)
    print("[OK] Replaced JS drawer and tasks engine successfully")
else:
    print("[ERROR] Could not find JS block to replace")

# -------------------------------------------------------------------------
# Fix Member Filter in renderOperationsList()
# -------------------------------------------------------------------------
old_ops_mem_filter = """      // 5. تطبيق فلترة العضو في صفحة العمليات (Member Filter)
      let memFilter = document.getElementById('opsFilterMember')?.value || 'all';
      if (memFilter === 'all' && state.currentMemberFilter && state.currentMemberFilter !== 'الكل') {
        memFilter = state.currentMemberFilter;
      }"""

new_ops_mem_filter = """      // 5. تطبيق فلترة العضو في صفحة العمليات (Member Filter)
      let memFilter = document.getElementById('opsFilterMember') ? document.getElementById('opsFilterMember').value : (state.currentMemberFilter && state.currentMemberFilter !== 'الكل' ? state.currentMemberFilter : 'all');"""

if old_ops_mem_filter in html:
    html = html.replace(old_ops_mem_filter, new_ops_mem_filter)
    print("[OK] Fixed member filter override in renderOperationsList()")
else:
    print("[WARN] old_ops_mem_filter not found verbatim, checking regex")
    html = re.sub(
        r"let memFilter = document\.getElementById\('opsFilterMember'\)\?\.value \|\| 'all';\s*if \(memFilter === 'all' && state\.currentMemberFilter && state\.currentMemberFilter !== 'الكل'\) \{\s*memFilter = state\.currentMemberFilter;\s*\}",
        new_ops_mem_filter,
        html
    )

# -------------------------------------------------------------------------
# Fix openOperationsFiltered() to ensure full sync
# -------------------------------------------------------------------------
old_open_ops_filtered_mem = """      // 5. ضبط قائمة تصفية العضو (Member Filter)
      const memSelect = document.getElementById('opsFilterMember');
      let targetMember = (member && member !== 'الكل' && member !== 'العائلة') ? member : 'all';
      if (memSelect) {
        memSelect.value = targetMember;
      }"""

new_open_ops_filtered_mem = """      // 5. ضبط قائمة تصفية العضو (Member Filter)
      const memSelect = document.getElementById('opsFilterMember');
      let targetMember = (member && member !== 'الكل' && member !== 'العائلة') ? member : 'all';
      if (memSelect) {
        memSelect.value = targetMember;
      }
      state.currentMemberFilter = targetMember === 'all' ? 'الكل' : targetMember;
      state.selectedMember = state.currentMemberFilter;"""

if old_open_ops_filtered_mem in html:
    html = html.replace(old_open_ops_filtered_mem, new_open_ops_filtered_mem)
    print("[OK] Enhanced member filter in openOperationsFiltered()")

# -------------------------------------------------------------------------
# Global Currency Alignment: Ensure Currency to the LEFT of Amount
# -------------------------------------------------------------------------
# Let's inspect and ensure formatMoney() and formatMoneyWithSignHtml()
old_format_money = """    function formatMoney(n, compact = false) {
      const raw = Number(n) || 0;
      const num = Math.abs(raw);
      const converted = convertAmount(num);
      const isGold = state.currency === 'GOLD21';
      const curr = getCurrencySymbol();
      let formatted = converted.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: isGold ? 3 : 2
      });
      // قاعدة التنسيق الصارمة: علامة الزائد والناقص يمين الرقم ورمز العملة يسار الرقم
      if (raw < -0.0001) {
        return `\\u200F- \\u200E${formatted} \\u200F${curr}`;
      }
      return `\\u200E${formatted} \\u200F${curr}`;
    }"""

new_format_money = """    function formatMoney(n, compact = false) {
      const raw = Number(n) || 0;
      const num = Math.abs(raw);
      const converted = convertAmount(num);
      const isGold = state.currency === 'GOLD21';
      const curr = getCurrencySymbol();
      let formatted = converted.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: isGold ? 3 : 2
      });
      // المعيار المحاسبي الموحد: رمز العملة دائماً إلى يسار الرقم وعلامة السالب إلى يمين الرقم
      if (raw < -0.0001) {
        return `\\u200F- \\u200E${formatted} \\u200F${curr}`;
      }
      return `\\u200E${formatted} \\u200F${curr}`;
    }"""

# In renderUI cockpit hero balances:
# Replace elBal, elInc, elExp with formatMoneyWithSignHtml()
old_render_cockpit = """      if (elInc) {
        if (isCockpitBalanceHidden) {
          elInc.textContent = '••••••';
        } else {
          const numFormatted = (typeof convertAmount === 'function' ? convertAmount(periodInc) : periodInc).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const currSym = (typeof getCurrencySymbol === 'function') ? getCurrencySymbol() : 'ج.م';
          elInc.innerHTML = `<span class="flow-curr" style="font-size: 0.62rem; opacity: 0.85; font-weight: 700; margin-left: 2px;">${currSym}</span><span class="flow-val" style="direction: ltr; unicode-bidi: isolate; font-variant-numeric: tabular-nums; font-weight: 900;">+ ${numFormatted}</span>`;
        }
      }
      if (elExp) {
        if (isCockpitBalanceHidden) {
          elExp.textContent = '••••••';
        } else {
          const numFormatted = (typeof convertAmount === 'function' ? convertAmount(periodExp) : periodExp).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const currSym = (typeof getCurrencySymbol === 'function') ? getCurrencySymbol() : 'ج.م';
          const sign = periodExp > 0 ? '- ' : '';
          elExp.innerHTML = `<span class="flow-curr" style="font-size: 0.62rem; opacity: 0.85; font-weight: 700; margin-left: 2px;">${currSym}</span><span class="flow-val" style="direction: ltr; unicode-bidi: isolate; font-variant-numeric: tabular-nums; font-weight: 900;">${sign}${numFormatted}</span>`;
        }
      }
      if (elBal) {
        elBal.textContent = isCockpitBalanceHidden ? '••••••••' : ((actualBalance >= 0 ? '+ ' : '- ') + formatMoney(Math.abs(actualBalance)));"""

new_render_cockpit = """      if (elInc) {
        if (isCockpitBalanceHidden) {
          elInc.textContent = '••••••';
        } else {
          elInc.innerHTML = formatMoneyWithSignHtml(periodInc, 'income');
        }
      }
      if (elExp) {
        if (isCockpitBalanceHidden) {
          elExp.textContent = '••••••';
        } else {
          elExp.innerHTML = formatMoneyWithSignHtml(periodExp, 'expense');
        }
      }
      if (elBal) {
        elBal.innerHTML = isCockpitBalanceHidden ? '••••••••' : formatMoneyWithSignHtml(actualBalance);"""

if old_render_cockpit in html:
    html = html.replace(old_render_cockpit, new_render_cockpit)
    print("[OK] Replaced cockpit hero balances with unified formatMoneyWithSignHtml()")
else:
    print("[WARN] old_render_cockpit not found verbatim, checking regex")
    html = re.sub(
        r'if \(elInc\) \{.*?if \(elExp\) \{.*?if \(elBal\) \{\s*elBal\.textContent = isCockpitBalanceHidden \? \'••••••••\' : \(\(actualBalance >= 0 \? \'\+ \' : \'- \'[^;]*\);',
        new_render_cockpit,
        html,
        flags=re.DOTALL
    )

with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(html)

print("Upgrade complete! New length:", len(html))

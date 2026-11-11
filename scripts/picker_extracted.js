TimeSummary();
    }

    function formatTimeReadable(timeStr) {
      if (!timeStr) return '';
      const [h, m] = timeStr.split(':').map(Number);
      const isPm = h >= 12;
      const h12 = h % 12 || 12;
      return `${h12}:${m < 10 ? '0' + m : m} ${isPm ? 'مساءً' : 'صباحاً'}`;
    }

    function updateTaskDateTimeSummary() {
      const summaryEl = document.getElementById('taskDateTimeSummaryBadge');
      if (!summaryEl) return;
      const now = new Date();
      const todayIso = getLocalDateStr(now);
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const tomorrowIso = getLocalDateStr(tomorrow);

      let dateName = taskSelectedDateVal;
      if (taskSelectedDateVal === todayIso) dateName = 'اليوم';
      else if (taskSelectedDateVal === tomorrowIso) dateName = 'غداً';

      const timeText = formatTimeReadable(taskSelectedTimeVal);
      summaryEl.textContent = `الموعد: ${dateName} ${timeText ? '• الساعة ' + timeText : ''}`;
    }

    function confirmTaskDateTimePicker() {
      const lbl = document.getElementById('lblQuickTaskDateTimeTrigger');
      const btn = document.getElementById('btnQuickTaskDateTimeTrigger');
      if (!taskSelectedDateVal) {
        taskSelectedDateVal = getLocalDateStr(new Date());
      }

      const now = new Date();
      const todayIso = getLocalDateStr(now);
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const tomorrowIso = getLocalDateStr(tomorrow);

      let dateName = taskSelectedDateVal;
      if (taskSelectedDateVal === todayIso) dateName = 'اليوم';
      else if (taskSelectedDateVal === tomorrowIso) dateName = 'غداً';

      const timeText = formatTimeReadable(taskSelectedTimeVal);
      const fullLabel = `📅 ${dateName} ${timeText ? '(' + timeText + ')' : ''}`;

      if (lbl) lbl.textContent = fullLabel;
      if (btn) {
        btn.style.background = 'rgba(168, 85, 247, 0.35)';
        btn.style.borderColor = '#c084fc';
        btn.style.color = '#ffffff';
      }

      window._activeQuickTaskDate = taskSelectedDateVal;
      window._activeQuickTaskTime = taskSelectedTimeVal;

      closeTaskDateTimePickerModal();
      showToast(`✅ تم تحديد موعد المهمة: ${fullLabel}`);
    }

    function clearTaskDateTimePicker() {
      taskSelectedDateVal = '';
      taskSelectedTimeVal = '';
      window._activeQuickTaskDate = '';
      window._activeQuickTaskTime = '';

      const lbl = document.getElementById('lblQuickTaskDateTimeTrigger');
      const btn = document.getElementById('btnQuickTaskDateTimeTrigger');
      if (lbl) lbl.textContent = '📅 تحديد التاريخ والساعة';
      if (btn) {
        btn.style.background = 'rgba(168, 85, 247, 0.20)';
        btn.style.borderColor = 'rgba(168, 85, 247, 0.55)';
        btn.style.color = '#e9d5ff';
      }

      closeTaskDateTimePickerModal();
      showToast('تم مسح موعد المهمة');
    }

    // =========================================================================
    // محرك التحديث الشامل والموازنة الفورية الموحد (Master Unified Sync & Audit Engine)
    // =========================================================================
    async function executeMasterUnifiedSyncAndRefresh(isManual = false) {
      if (window.isMasterSyncRunning) return;
      window.isMasterSyncRunning = true;

      const spinIcon = document.getElementById('headerMasterSyncSpinIcon');
      const statusText = document.getElementById('topDriveSyncStatusText');
      if (spinIcon) spinIc
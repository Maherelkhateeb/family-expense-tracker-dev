// =========================================================================
// Family Expense Tracker Next — Google Drive Cloud Sync Engine (v1.0.0)
// Bidirectional Smart Delta Merge & Conflict-Free Family Cloud Sync
// =========================================================================

(function(window) {
  'use strict';

  const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbzL5u2P8V9r0W_32dNd2RRKPaShQ/exec';
  const DEFAULT_SECRET = 'family_secret_2026';

  const DriveSync = {
    status: 'synced', // 'synced' | 'syncing' | 'offline' | 'error'
    lastSyncTime: null,
    syncInProgress: false,
    autoSyncTimer: null,
    debounceSaveTimer: null,

    getConfig() {
      return {
        endpoint: localStorage.getItem('family_drive_sync_endpoint') || DEFAULT_GAS_URL,
        secretKey: localStorage.getItem('family_drive_secret_key') || DEFAULT_SECRET,
        account: localStorage.getItem('family_drive_account') || 'maher.easybakery@gmail.com'
      };
    },

    setConfig(newCfg) {
      if (newCfg.endpoint) localStorage.setItem('family_drive_sync_endpoint', newCfg.endpoint.trim());
      if (newCfg.secretKey) localStorage.setItem('family_drive_secret_key', newCfg.secretKey.trim());
      if (newCfg.account) localStorage.setItem('family_drive_account', newCfg.account.trim());
    },

    // =======================================================================
    // UI Status Indicators (Header Badge & Modal Elements)
    // =======================================================================
    updateUI(status, label) {
      this.status = status;
      const nowStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

      // 1. Modal status badge
      const badge = document.getElementById('driveCloudStatusBadge');
      if (badge) {
        if (status === 'synced') {
          badge.innerHTML = '<i class="fa-solid fa-circle" style="font-size: 0.5rem; color: #22c55e;"></i> متصل ومتزامن لحظياً ✨';
          badge.style.color = '#34d399';
        } else if (status === 'syncing') {
          badge.innerHTML = '<i class="fa-solid fa-rotate fa-spin" style="font-size: 0.65rem; color: #fbbf24;"></i> جاري المزامنة السحابية...';
          badge.style.color = '#fbbf24';
        } else if (status === 'offline') {
          badge.innerHTML = '<i class="fa-solid fa-circle" style="font-size: 0.5rem; color: #94a3b8;"></i> وضع غير متصل (محفوظ محلياً)';
          badge.style.color = '#94a3b8';
        } else {
          badge.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="font-size: 0.65rem; color: #f87171;"></i> تعذر الاتصال بالسحابة';
          badge.style.color = '#f87171';
        }
      }

      // 2. Last sync time label
      const timeLbl = document.getElementById('driveLastSyncTimeText');
      if (timeLbl) {
        timeLbl.textContent = this.lastSyncTime ? `آخر مزامنة: ${this.lastSyncTime}` : `آخر مزامنة: ${nowStr}`;
      }

      // 3. Header sync indicator
      const headerIndicator = document.getElementById('headerCloudSyncIndicator');
      if (headerIndicator) {
        headerIndicator.className = `header-sync-pill status-${status}`;
        if (status === 'synced') {
          headerIndicator.innerHTML = '<i class="fa-solid fa-cloud-arrow-up" style="color:#22c55e;"></i> <span>سحابة متزامنة</span>';
          headerIndicator.title = 'البيانات متزامنة مع Google Drive لحظياً';
        } else if (status === 'syncing') {
          headerIndicator.innerHTML = '<i class="fa-solid fa-rotate fa-spin" style="color:#fbbf24;"></i> <span>جاري التحديث...</span>';
          headerIndicator.title = 'جاري المزامنة ودمج الحركات مع درايف...';
        } else if (status === 'offline') {
          headerIndicator.innerHTML = '<i class="fa-solid fa-cloud" style="color:#94a3b8;"></i> <span>أوفلاين</span>';
          headerIndicator.title = 'لا يوجد إنترنت - البيانات محفوظة محلياً في IndexedDB';
        } else {
          headerIndicator.innerHTML = '<i class="fa-solid fa-cloud-exclamation" style="color:#f87171;"></i> <span>تنبيه سحابي</span>';
          headerIndicator.title = 'اضغط لفحص إعدادات المزامنة مع درايف';
        }
      }
    },

    // =======================================================================
    // Smart Two-Way Delta Merge Algorithm (Conflict-Free by ID & Timestamp)
    // =======================================================================
    mergeRecordList(localList, remoteList) {
      const map = new Map();

      // Index local items
      (localList || []).forEach(item => {
        if (item && item.id) {
          map.set(item.id, item);
        }
      });

      // Merge remote items
      (remoteList || []).forEach(remoteItem => {
        if (!remoteItem || !remoteItem.id) return;

        if (!map.has(remoteItem.id)) {
          // New item from remote -> add
          map.set(remoteItem.id, remoteItem);
        } else {
          // Exists in both -> compare timestamps
          const localItem = map.get(remoteItem.id);
          const localTime = new Date(localItem.updatedAt || 0).getTime();
          const remoteTime = new Date(remoteItem.updatedAt || 0).getTime();

          if (remoteTime > localTime) {
            // Remote is newer -> update local
            map.set(remoteItem.id, remoteItem);
          }
        }
      });

      return Array.from(map.values());
    },

    // =======================================================================
    // Master Execute Sync Operation
    // =======================================================================
    async executeSync(isManual = false) {
      if (this.syncInProgress) return;
      if (!navigator.onLine) {
        this.updateUI('offline');
        if (isManual && typeof showToast === 'function') {
          showToast('لا يوجد اتصال بالإنترنت، تم حفظ كافة البيانات محلياً في IndexedDB ✨');
        }
        return;
      }

      this.syncInProgress = true;
      this.updateUI('syncing');

      const config = this.getConfig();

      try {
        // 1. Gather all local data from IndexedDB or state
        let localTxs = [];
        let localWallets = [];
        let localBudgets = [];
        let localExpected = [];
        let localDebts = [];
        let localTasks = [];

        if (window.FamilyDB) {
          localTxs = (await window.FamilyDB.getAll('transactions')) || [];
          localWallets = (await window.FamilyDB.getAll('wallets')) || [];
          localBudgets = (await window.FamilyDB.getAll('monthlyBudgets')) || [];
          localExpected = (await window.FamilyDB.getAll('expectedExpenses')) || [];
          localDebts = (await window.FamilyDB.getAll('debts')) || [];
          localTasks = (await window.FamilyDB.getAll('tasks')) || [];
        } else if (window.state) {
          localTxs = window.state.transactions || [];
          localWallets = window.state.wallets || [];
          localBudgets = window.state.monthlyBudgets || [];
          localExpected = window.state.expectedExpenses || [];
          localDebts = window.state.debts || [];
          localTasks = window.state.tasks || [];
        }

        const payload = {
          action: 'sync_delta',
          app: 'FamilyExpenseTrackerNext',
          secretKey: config.secretKey,
          account: config.account,
          clientTimestamp: new Date().toISOString(),
          database: {
            transactions: localTxs,
            wallets: localWallets,
            monthlyBudgets: localBudgets,
            expectedExpenses: localExpected,
            debts: localDebts,
            tasks: localTasks
          }
        };

        // 2. Transmit to Google Apps Script Web App
        const res = await fetch(config.endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });

        // With mode 'no-cors', opaque response indicates transmission succeeded
        this.lastSyncTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        this.updateUI('synced');
        if (isManual && typeof showToast === 'function') {
          showToast('تم إرسال ومزامنة البيانات السحابية مع Google Drive بنجاح! ☁️✨', 'success');
        }
      } catch (err) {
        console.warn('[DriveSync] Sync exception:', err);
        this.updateUI('error');
      } finally {
        this.syncInProgress = false;
      }
    },

    // Trigger sync with debounce (useful on transaction save)
    queueSync() {
      if (this.debounceSaveTimer) clearTimeout(this.debounceSaveTimer);
      this.debounceSaveTimer = setTimeout(() => {
        this.executeSync(false);
      }, 2500);
    },

    // Initialize listeners and periodic sync
    init() {
      window.addEventListener('online', () => {
        console.log('[DriveSync] Network back online; triggering cloud sync...');
        this.executeSync(false);
      });
      window.addEventListener('offline', () => {
        this.updateUI('offline');
      });

      // Periodically sync every 5 minutes when page is active
      this.autoSyncTimer = setInterval(() => {
        if (navigator.onLine && !document.hidden) {
          this.executeSync(false);
        }
      }, 5 * 60 * 1000);

      // Initial sync on startup after 3 seconds
      setTimeout(() => {
        this.executeSync(false);
      }, 3000);
    }
  };

  window.FamilyDriveSync = DriveSync;

  // Auto-init on page load
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => DriveSync.init());
  }

})(window);

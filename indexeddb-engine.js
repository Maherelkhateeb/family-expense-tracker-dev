// =========================================================================
// Family Expense Tracker Next — IndexedDB Storage Engine (v1.0.0)
// High-Capacity Offline Storage & Zero-Data-Loss Local-First Storage Layer
// =========================================================================

(function(window) {
  'use strict';

  const DB_NAME = 'FamilyExpenseTrackerDB';
  const DB_VERSION = 1;

  const STORES = {
    transactions: 'id',
    wallets: 'id',
    expectedExpenses: 'id',
    monthlyBudgets: 'id',
    debts: 'id',
    notes: 'id',
    tasks: 'id',
    activityLog: 'id',
    meta: 'key'
  };

  let dbInstance = null;
  let initPromise = null;

  function openDatabase() {
    if (initPromise) return initPromise;

    initPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('[FamilyDB] IndexedDB not supported; fallback to localStorage');
        resolve(null);
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = function(e) {
        const db = e.target.result;

        // 1. Transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txStore.createIndex('date', 'date', { unique: false });
          txStore.createIndex('category', 'category', { unique: false });
          txStore.createIndex('member', 'member', { unique: false });
          txStore.createIndex('walletId', 'walletId', { unique: false });
          txStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          txStore.createIndex('isDeleted', 'isDeleted', { unique: false });
        }

        // 2. Wallets store
        if (!db.objectStoreNames.contains('wallets')) {
          const wStore = db.createObjectStore('wallets', { keyPath: 'id' });
          wStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // 3. Other stores
        ['expectedExpenses', 'monthlyBudgets', 'debts', 'notes', 'tasks', 'activityLog'].forEach(s => {
          if (!db.objectStoreNames.contains(s)) {
            const st = db.createObjectStore(s, { keyPath: 'id' });
            if (s === 'activityLog' || s === 'tasks') {
              st.createIndex('timestamp', 'timestamp', { unique: false });
            }
          }
        });

        // 4. Meta store (key-value)
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      };

      request.onsuccess = function(e) {
        dbInstance = e.target.result;
        console.log('[FamilyDB] IndexedDB connected successfully');
        resolve(dbInstance);
      };

      request.onerror = function(e) {
        console.warn('[FamilyDB] Failed to open IndexedDB:', e.target.error);
        resolve(null); // graceful fallback to localStorage
      };
    });

    return initPromise;
  }

  // Helper for transaction operations
  async function withStore(storeName, mode, callback) {
    const db = await openDatabase();
    if (!db) return null;

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const req = callback(store);

        tx.oncomplete = () => resolve(req ? req.result : true);
        tx.onerror = () => {
          console.warn(`[FamilyDB] Transaction error in store ${storeName}:`, tx.error);
          resolve(null);
        };
      } catch (err) {
        console.warn(`[FamilyDB] Error accessing store ${storeName}:`, err);
        resolve(null);
      }
    });
  }

  // =========================================================================
  // CRUD Operations
  // =========================================================================

  async function get(storeName, id) {
    return withStore(storeName, 'readonly', store => store.get(id));
  }

  async function getAll(storeName) {
    return withStore(storeName, 'readonly', store => store.getAll()) || [];
  }

  async function put(storeName, item) {
    if (!item.id && storeName !== 'meta') {
      item.id = 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }
    if (!item.updatedAt && storeName !== 'meta') {
      item.updatedAt = new Date().toISOString();
    }
    return withStore(storeName, 'readwrite', store => store.put(item));
  }

  async function putMany(storeName, items) {
    if (!items || !items.length) return true;
    const db = await openDatabase();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        items.forEach(item => {
          if (!item.id && storeName !== 'meta') {
            item.id = 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
          }
          if (!item.updatedAt && storeName !== 'meta') {
            item.updatedAt = new Date().toISOString();
          }
          store.put(item);
        });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (err) {
        console.warn(`[FamilyDB] putMany error in ${storeName}:`, err);
        resolve(false);
      }
    });
  }

  async function remove(storeName, id) {
    return withStore(storeName, 'readwrite', store => store.delete(id));
  }

  async function clear(storeName) {
    return withStore(storeName, 'readwrite', store => store.clear());
  }

  // =========================================================================
  // Auto-Migration Bridge (Zero Data Loss from localStorage)
  // =========================================================================
  async function autoMigrateFromLocalStorage() {
    try {
      const db = await openDatabase();
      if (!db) return false;

      const meta = await get('meta', 'migrated_v1');
      if (meta && meta.value === true) {
        return true; // Already migrated
      }

      console.log('[FamilyDB] Initiating automatic migration from localStorage to IndexedDB...');

      // 1. Transactions
      let txs = [];
      try {
        txs = JSON.parse(localStorage.getItem('family_monefy_transactions') || '[]');
      } catch(e) {}
      if (Array.isArray(txs) && txs.length) {
        txs = txs.map(t => ({
          id: t.id || ('tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)),
          date: t.date || new Date().toISOString().split('T')[0],
          time: t.time || '12:00',
          amount: parseFloat(t.amount) || 0,
          category: t.category || 'عام',
          type: t.type || 'expense',
          member: t.member || 'ماهر',
          walletId: t.walletId || 'w1',
          label: t.label || '',
          notes: t.notes || '',
          receipt: t.receipt || null,
          updatedAt: t.updatedAt || new Date().toISOString(),
          isDeleted: t.isDeleted || false
        }));
        await putMany('transactions', txs);
        console.log(`[FamilyDB] Migrated ${txs.length} transactions to IndexedDB.`);
      }

      // 2. Wallets
      let wallets = [];
      try {
        wallets = JSON.parse(localStorage.getItem('family_monefy_wallets') || '[]');
      } catch(e) {}
      if (Array.isArray(wallets) && wallets.length) {
        await putMany('wallets', wallets);
      }

      // 3. Expected Expenses
      let expected = [];
      try {
        expected = JSON.parse(localStorage.getItem('family_monefy_expected') || '[]');
      } catch(e) {}
      if (Array.isArray(expected) && expected.length) {
        await putMany('expectedExpenses', expected);
      }

      // 4. Monthly Budgets
      let budgets = [];
      try {
        budgets = JSON.parse(localStorage.getItem('family_monefy_monthly_budgets') || '[]');
      } catch(e) {}
      if (Array.isArray(budgets) && budgets.length) {
        await putMany('monthlyBudgets', budgets);
      }

      // 5. Debts, Notes, Tasks, ActivityLog
      const otherKeys = [
        ['family_monefy_debts', 'debts'],
        ['family_monefy_notes', 'notes'],
        ['family_monefy_tasks', 'tasks'],
        ['family_monefy_activity_log', 'activityLog']
      ];
      for (const [lsKey, storeName] of otherKeys) {
        try {
          const items = JSON.parse(localStorage.getItem(lsKey) || '[]');
          if (Array.isArray(items) && items.length) {
            await putMany(storeName, items);
          }
        } catch(e) {}
      }

      // Mark migration complete
      await put('meta', { key: 'migrated_v1', value: true, migratedAt: new Date().toISOString() });
      console.log('[FamilyDB] Auto-migration successfully completed!');
      return true;
    } catch (err) {
      console.warn('[FamilyDB] Error during auto-migration:', err);
      return false;
    }
  }

  // =========================================================================
  // Synchronous State Bridge (Keeps window.state and IndexedDB in harmony)
  // =========================================================================
  async function syncStateFromIndexedDB(state) {
    try {
      const db = await openDatabase();
      if (!db) return false;

      const txs = await getAll('transactions');
      if (Array.isArray(txs) && txs.length) {
        // filter out soft-deleted items for UI display
        state.transactions = txs.filter(t => !t.isDeleted);
      }

      const wallets = await getAll('wallets');
      if (Array.isArray(wallets) && wallets.length) {
        state.wallets = wallets;
      }

      const budgets = await getAll('monthlyBudgets');
      if (Array.isArray(budgets) && budgets.length) {
        state.monthlyBudgets = budgets;
      }

      const expected = await getAll('expectedExpenses');
      if (Array.isArray(expected) && expected.length) {
        state.expectedExpenses = expected;
      }

      const debts = await getAll('debts');
      if (Array.isArray(debts) && debts.length) {
        state.debts = debts;
      }

      const notes = await getAll('notes');
      if (Array.isArray(notes) && notes.length) {
        state.notes = notes;
      }

      const tasks = await getAll('tasks');
      if (Array.isArray(tasks) && tasks.length) {
        state.tasks = tasks;
      }

      const activity = await getAll('activityLog');
      if (Array.isArray(activity) && activity.length) {
        state.activityLog = activity;
      }

      return true;
    } catch(err) {
      console.warn('[FamilyDB] syncStateFromIndexedDB error:', err);
      return false;
    }
  }

  // Export module interface
  window.FamilyDB = {
    open: openDatabase,
    get,
    getAll,
    put,
    putMany,
    remove,
    clear,
    autoMigrateFromLocalStorage,
    syncStateFromIndexedDB
  };

  // Kick off connection and migration immediately
  if (typeof window !== 'undefined') {
    openDatabase().then(() => autoMigrateFromLocalStorage());
  }

})(window);

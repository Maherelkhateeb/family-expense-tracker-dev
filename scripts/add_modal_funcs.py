import sys

filepath = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

modal_funcs = '''
    let activeModalsStack = [];

    function pushModalState(id) {
      if (!activeModalsStack.includes(id)) {
        activeModalsStack.push(id);
        try { window.history.pushState({ modalId: id }, ''); } catch(e){}
      }
    }

    function popModalState(id) {
      const idx = activeModalsStack.indexOf(id);
      if (idx !== -1) {
        activeModalsStack.splice(idx, 1);
      }
    }

    function closeSpecificModalOrDrawer(id, fromPopState = false) {
      popModalState(id);
      if (id === 'goldDrawer' || id === 'tradingviewDrawer') {
        if (typeof closeGoldDrawer === 'function') closeGoldDrawer(true);
      } else if (id === 'summaryDrawer' || id === 'summaryLeftDrawer') {
        if (typeof closeSummaryLeftDrawer === 'function') closeSummaryLeftDrawer(true);
      } else {
        const modal = document.getElementById(id);
        if (modal) {
          modal.classList.remove('open');
          modal.classList.remove('active');
          if (modal.style.display !== 'none' && modal.classList.contains('modal-overlay-custom')) {
            modal.style.display = 'none';
          }
        }
      }
      if (!fromPopState) {
        try {
          if (window.history.state && window.history.state.modalId === id) {
            window.history.back();
          }
        } catch(e) {}
      }
    }

    function openModal(id) {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('open');
        el.classList.add('active');
        if (el.classList.contains('modal-overlay-custom') || el.classList.contains('modal-overlay')) {
          el.style.display = 'flex';
        }
        pushModalState(id);
      }
    }

    function closeModal(id) {
      closeSpecificModalOrDrawer(id, false);
    }

    function showToast(msg) {
      const t = document.getElementById('toastMsg');
      const txt = document.getElementById('toastTxt');
      if (txt) txt.textContent = msg;
      if (t) {
        t.classList.add('show');
        clearTimeout(window._toastTimeout);
        window._toastTimeout = setTimeout(() => t.classList.remove('show'), 3500);
      }
    }
'''

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = '    var currentEditTxReceiptDataUri = null;'
if target in content:
    content = content.replace(target, modal_funcs + '\n    var currentEditTxReceiptDataUri = null;', 1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Inserted modal and toast functions successfully!')
else:
    print('Target not found')

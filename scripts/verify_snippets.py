import os, re, sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

print("File loaded, length:", len(content))

# Verify target 1: Commitments unclosed div
t1 = '''              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px; margin-top: 6px;">
                <button type="submit" class="btn-submit-tx" style="height: 38px; background: linear-gradient(135deg, #f59e0b, #d97706); border: none; border-radius: 8px; font-weight: 900; font-size: 0.80rem; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  <i class="fa-solid fa-floppy-disk"></i> حفظ الفاتورة وتثبيتها
                </button>
                <button type="button" onclick="toggleBillsExpectedPanel()" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); height: 38px; border-radius: 8px; color: #94a3b8; font-weight: 800; font-size: 0.80rem; cursor: pointer;">
                  إلغاء / إغلاق
                </button>
              </div><!-- replaced single submit -->
              <div style="display:none;"><button type="button"> حفظ الفاتورة وتثبيتها
              </button>
            </form>'''

print("Target 1 found:", t1 in content)

# Verify target 2: Currency safeEvent
t2 = "safeEvent('btnToggleCurrency', 'click', toggleCurrency);"
print("Target 2 found:", t2 in content)

# Verify target 3: Lightbox modal tag
t3 = '<div class="modal-overlay modal-overlay-custom" id="receiptLightboxModal">'
print("Target 3 found:", t3 in content)

# Verify target 4: btnOpenTasksDrawer
t4 = 'id="btnOpenTasksDrawer" onclick="openSummaryDrawer(\'tasks\')"'
print("Target 4 found:", t4 in content)

import re

path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

print("File size:", len(content))

# 1. Check unclosed div in panelBillsExpected
target1 = '''              <div style="display:none;"><button type="button"> حفظ الفاتورة وتثبيتها
              </button>
            </form>'''
print("Target 1 found:", target1 in content)

# 2. Check safeEvent for btnToggleCurrency
target2 = "safeEvent('btnToggleCurrency', 'click', toggleCurrency);"
print("Target 2 found:", target2 in content)

# 3. Check receiptLightboxModal tag
target3 = '<div class="modal-overlay modal-overlay-custom" id="receiptLightboxModal">'
print("Target 3 found:", target3 in content)

# 4. Check opsFilterCategory
target4 = '<select id="opsFilterCategory" class="form-input-custom" onchange="filterOperationsList()"'
print("Target 4 found:", target4 in content)

# 5. Check btnOpenTasksDrawer
target5 = 'id="btnOpenTasksDrawer" onclick="openSummaryDrawer(\'tasks\')"'
print("Target 5 found:", target5 in content)

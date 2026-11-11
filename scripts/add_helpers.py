import sys

filepath = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

helpers_code = '''
    // دوال مساعدة عامة أساسية
    function escapeHtml(t) {
      if (t === null || t === undefined) return '';
      const d = document.createElement('div');
      d.textContent = String(t);
      return d.innerHTML;
    }

    function initDonutChart() {
      // تم استبدال الشارت الدائري ببنود الرصيد والتحليلات الفاخرة
    }

    function initActivityLog() {
      const stored = localStorage.getItem('family_monefy_activity_log');
      if (stored) {
        try {
          state.activityLog = JSON.parse(stored);
        } catch(e) {
          state.activityLog = [];
        }
      }
      if (!state.activityLog) state.activityLog = [];
    }
'''

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = '  <script>\n'
if target in content:
    content = content.replace(target, target + helpers_code, 1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Inserted helper functions successfully!')
else:
    print('Target script tag not found!')

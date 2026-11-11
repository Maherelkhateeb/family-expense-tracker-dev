import sys

filepath = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = '    function initActivityLog() {'
replacement = '''    let currentActivityTab = 'all';
    let currentSelectedActivityItem = null;
    let archiveRenderLimit = 50;

    function saveActivityLog() {
      try {
        localStorage.setItem('family_monefy_activity_log', JSON.stringify(state.activityLog || []));
      } catch(e) {}
    }

    function logActivity(entry) {
      if (!state.activityLog) state.activityLog = [];
      const newEntry = {
        id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        timestamp: new Date().toISOString(),
        date: entry.date || new Date().toISOString().split('T')[0],
        time: entry.time || new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        author: state.currentUser || 'ماهر',
        ...entry
      };
      state.activityLog.unshift(newEntry);
      if (state.activityLog.length > 600) state.activityLog.pop();
      saveActivityLog();
      try {
        if (typeof syncChannel !== 'undefined' && syncChannel) {
          syncChannel.postMessage({ type: 'SYNC_ACTIVITY', activity: newEntry });
        }
      } catch(e) {}
    }

    function initActivityLog() {'''

if target in content:
    content = content.replace(target, replacement, 1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Added logActivity and state variables successfully!')
else:
    print('Target not found!')

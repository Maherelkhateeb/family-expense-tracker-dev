with open(r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_convert = '''    // تحويل المهمة إلى مصروف أو التزام مالي بلمسة واحدة
    function convertTaskToExpense(taskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      closeSummaryLeftDrawer();
      
      // فتح نافذة المعاملة وتجهيز البيان
      setTimeout(() => {
        openTxModal('expense');
        const descInp = document.getElementById('txDescription') || document.getElementById('expenseDescInput');
        if (descInp) {
          descInp.value = task.title;
        }
        showToast(`💡 تم تجهيز تسجيل مصروف للمهمة: ${task.title}`);
      }, 200);
    }'''

new_convert = '''    // تحويل المهمة إلى مصروف أو التزام مالي بلمسة واحدة
    function convertTaskToExpense(taskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      closeSummaryLeftDrawer();
      
      let preCat = 'other';
      if (task.tag === 'bills') preCat = 'bills';
      else if (task.tag === 'shopping') preCat = 'food';
      else if (task.tag === 'home') preCat = 'house';

      setTimeout(() => {
        openTxModal('expense', preCat);
        const labelInp = document.getElementById('inpTxLabel');
        if (labelInp) {
          labelInp.value = task.title;
        }
        showToast(`💡 تم تجهيز تسجيل مصروف للمهمة: ${task.title}`);
      }, 250);
    }'''

assert old_convert in content, "old_convert not found!"
content = content.replace(old_convert, new_convert, 1)

with open(r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated convertTaskToExpense successfully!")

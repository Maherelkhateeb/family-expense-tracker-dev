with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''      if (pBadge) {
        if (overallPct === 100 && totalCount > 0) pBadge.textContent = '🌟 إنجاز 100% مبهر!';
        else if (overallPct >= 60) pBadge.textContent = '🔥 إنتاجية عالية';
        else pBadge.textContent = `${activeCount} مهام متبقية`;
      }'''

replacement = '''      if (pBadge) {
        if (overallPct === 100 && totalCount > 0) pBadge.textContent = '🌟 إنجاز 100% مبهر!';
        else if (overallPct >= 60) pBadge.textContent = '🔥 إنتاجية عالية';
        else pBadge.textContent = `${activeCount} مهام متبقية`;
      }

      // تحديث عدادات رقائق الفئات التفاعلية
      const bAll = document.getElementById('catBadgeAll');
      const bShop = document.getElementById('catBadgeShopping');
      const bBills = document.getElementById('catBadgeBills');
      const bHealth = document.getElementById('catBadgeHealth');
      const bHome = document.getElementById('catBadgeHome');
      const bWork = document.getElementById('catBadgeWork');

      if (bAll) bAll.textContent = allTasks.filter(t => !t.completed).length;
      if (bShop) bShop.textContent = allTasks.filter(t => !t.completed && t.tag === 'shopping').length;
      if (bBills) bBills.textContent = allTasks.filter(t => !t.completed && (t.tag === 'bills' || t.tag === 'commitments')).length;
      if (bHealth) bHealth.textContent = allTasks.filter(t => !t.completed && t.tag === 'health').length;
      if (bHome) bHome.textContent = allTasks.filter(t => !t.completed && t.tag === 'home').length;
      if (bWork) bWork.textContent = allTasks.filter(t => !t.completed && t.tag === 'work').length;'''

if target in text:
    text = text.replace(target, replacement, 1)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Successfully patched category badges live counter!")
else:
    print("Could not find target in index.html")

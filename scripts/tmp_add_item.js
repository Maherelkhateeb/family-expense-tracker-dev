function addBudgetItemToCurrentPlan() {
      if (!currentBudgetMonthData) return;

      const catSel = document.getElementById('inpBudgetItemCategory');
      const amtInp = document.getElementById('inpBudgetItemAmount');
      const titleInp = document.getElementById('inpBudgetItemTitle');

      const catId = catSel ? catSel.value : 'other';
      const amt = parseFloat(amtInp ? amtInp.value : 0);
      let title = titleInp ? titleInp.value.trim() : '';

      if (isNaN(amt) || amt <= 0) {
        showToast('⚠️ الرجاء إدخال مبلغ تقديري صحيح للبند');
        if (amtInp) amtInp.focus();
        return;
      }

      if (!title) {
        const catObj = EXPENSE_CATEGORIES.find(c => c.id === catId);
        title = catObj ? catObj.name : 'بند مصروف';
      }

      if (!currentBudgetMonthData.items) currentBudgetMonthData.items = [];

      const newItem = {
        id: 'b-item-' + Date.now(),
        category: catId,
        title: title,
        amount: amt,
        members: selectedBudgetItemMembers.length > 0 ? [...selectedBudgetItemMembers] : ['البيت'],
        notes: ''
      };

      currentBudgetMonthData.items.push(newItem);
      syncBudgetCategoriesMap(currentBudgetMonthData);

      // تنظيف الخانات بعد الإضافة
      if (amtInp) amtInp.value = '';
      if (titleInp) titleInp.value = '';
      selectedBudgetItemMembers = ['البيت'];
      renderBudgetMembersMultiPicker();

      renderMonthlyBudgetAllocations();
      showToast(`➕ تم إضافة بند (${title} - ${formatMoney(amt)}) بنجاح! ✨`);
    }

    // حذف بند مصروف من الميزانية
    function deleteBudgetItem(itemId) {
      if (!currentBudgetMonthData || !currentBudgetMonthData.items) return;
      const it = currentBudgetMonthData.items.find(i => i.id === itemId);
      const title = it ? it.title : 'هذا البند';
      currentBudgetMonthData.items = currentBudgetMonthData.items.filter(i => i.id !== itemId);
      syncBudgetCategoriesMap(currentBudgetMonthData);
      renderMonthlyBudgetAllocations();
   
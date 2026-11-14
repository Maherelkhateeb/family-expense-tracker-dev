import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

INDEX_PATH = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    html = f.read()

bad_block = """      container.innerHTML = cardsHtml;
      const fullContainer = document.getElementById('tasksFullScreenContainerList');
      if (fullContainer) {
        fullContainer.innerHTML = cardsHtml;
      }
      // تحديث شارات ونسبة الشاشة الكاملة
      const kpiTotF = document.getElementById('kpiTasksTotalFull');
      const kpiActF = document.getElementById('kpiTasksActiveFull');
      const kpiOvdF = document.getElementById('kpiTasksOverdueFull');
      const kpiDonF = document.getElementById('kpiTasksDoneFull');
      const barF = document.getElementById('tasksOverallProgressBarFull');
      const pctF = document.getElementById('tasksOverallProgressPctFull');
      if (kpiTotF) kpiTotF.textContent = totalCount;
      if (kpiActF) kpiActF.textContent = activeCount;
      if (kpiOvdF) kpiOvdF.textContent = overdueCount;
      if (kpiDonF) kpiDonF.textContent = doneCount;
      if (barF) barF.style.width = `${completionRate}%`;
      if (pctF) pctF.textContent = `${completionRate}%`;
    }"""

good_block = """      container.innerHTML = cardsHtml;
    }"""

if bad_block in html:
    html = html.replace(bad_block, good_block)
    print("[OK] Removed erroneous tasks code from renderOperationsList()")
else:
    print("[WARN] bad_block not found verbatim, checking regex")
    import re
    html = re.sub(
        r"container\.innerHTML = cardsHtml;\s*const fullContainer = document\.getElementById\('tasksFullScreenContainerList'\);.*?if \(pctF\) pctF\.textContent = `\$\{completionRate\}%`;\s*\}",
        good_block,
        html,
        flags=re.DOTALL
    )

with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(html)

print("[OK] Saved index.html with clean renderOperationsList()")

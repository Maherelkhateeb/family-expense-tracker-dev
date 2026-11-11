with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

target_bad = '''      }

      // 7. تحديث إحصائيات الهيدر المصرفيiner = document.getElementById('tasksFullScreenContainerList');
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
    }'''

replacement_good = '''      }

      if (container) {
        container.innerHTML = cardsHtml;
      }
    }'''

# try with CRLF or LF
if target_bad in text:
    text = text.replace(target_bad, replacement_good, 1)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Fixed renderOperationsList end successfully (LF)!")
else:
    target_bad_crlf = target_bad.replace('\n', '\r\n')
    replacement_good_crlf = replacement_good.replace('\n', '\r\n')
    if target_bad_crlf in text:
        text = text.replace(target_bad_crlf, replacement_good_crlf, 1)
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(text)
        print("Fixed renderOperationsList end successfully (CRLF)!")
    else:
        print("Could not find exact target_bad snippet")

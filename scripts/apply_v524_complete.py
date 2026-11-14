import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# -----------------------------------------------------------------------------
# 1. Update Script #5 with the new Tasks, Calendar & Date-Time Picker Engine
# -----------------------------------------------------------------------------
with open('scripts/tasks_engine_v524_code.js', 'r', encoding='utf-8') as f_js:
    v524_engine_code = f_js.read()

marker = '// TASKS & CALENDAR ENGINE PRO (v5.2.3 Master Unified)'
pos_engine = html.find(marker)
if pos_engine != -1:
    # find closing </script> after pos_engine
    pos_script_end = html.find('</script>', pos_engine)
    html = html[:pos_engine] + v524_engine_code + "\n    " + html[pos_script_end:]
    print("✓ Successfully replaced tasks engine in Script #5 with v5.2.4")
else:
    print("Warning: marker not found, appending to Script #5")
    s5_end = html.rfind('</script>')
    html = html[:s5_end] + "\n\n" + v524_engine_code + "\n" + html[s5_end:]

# -----------------------------------------------------------------------------
# 2. Fix Indicators / Analytics Period Filters in Script #4
# -----------------------------------------------------------------------------
old_set_ana_period = '''function setAnalyticsPeriod(period) {
      setAppPeriod(period === 'day' ? 'today' : period);
      const customBox = document.getElementById('analyticsCustomRangeBox');
      if (customBox) customBox.style.display = (period === 'custom') ? 'block' : 'none';
    }'''

new_set_ana_period = '''function setAnalyticsPeriod(period) {
      state.period = period === 'day' ? 'today' : period;
      const customBox = document.getElementById('analyticsCustomRangeBox');
      if (customBox) customBox.style.display = (period === 'custom') ? 'block' : 'none';

      document.querySelectorAll('.analytics-period-btn').forEach(b => {
        const btnP = b.getAttribute('data-period');
        if (btnP === period || (period === 'day' && btnP === 'today') || (period === 'today' && btnP === 'day')) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      const periodLabels = {
        'today': 'اليوم',
        'day': 'اليوم',
        'week': 'الأسبوع الحالي',
        'month': 'الشهر الحالي',
        'all': 'كافة الفترات',
        'custom': 'فترة مخصصة'
      };
      const anaPill = document.getElementById('analyticsPeriodActivePill');
      if (anaPill) anaPill.textContent = periodLabels[period] || period;

      setAppPeriod(period === 'day' ? 'today' : period);
      if (typeof updateAnalyticsChart === 'function') updateAnalyticsChart();
      if (typeof renderAnalyticsUI === 'function') renderAnalyticsUI();
      if (typeof renderExecutiveKPIs === 'function') renderExecutiveKPIs();
      if (typeof renderExecutiveCharts === 'function') renderExecutiveCharts();
    }'''

if old_set_ana_period in html:
    html = html.replace(old_set_ana_period, new_set_ana_period, 1)
    print("✓ Successfully updated setAnalyticsPeriod function")
else:
    print("Warning: old_set_ana_period not found directly")

# Also ensure setAppPeriod triggers updateAnalyticsChart
old_set_app_period_tail = '''renderUI();
      if (typeof filterOperationsList === "function") filterOperationsList();
      showToast(`📅 تم تطبيق الفترة: ${periodLabels[p] || p}`);'''

new_set_app_period_tail = '''renderUI();
      if (typeof filterOperationsList === "function") filterOperationsList();
      if (typeof updateAnalyticsChart === "function") updateAnalyticsChart();
      if (typeof renderAnalyticsUI === "function") renderAnalyticsUI();
      if (typeof renderExecutiveKPIs === "function") renderExecutiveKPIs();
      if (typeof renderExecutiveCharts === "function") renderExecutiveCharts();
      showToast(`📅 تم تطبيق الفترة: ${periodLabels[p] || p}`);'''

if old_set_app_period_tail in html:
    html = html.replace(old_set_app_period_tail, new_set_app_period_tail, 1)
    print("✓ Successfully updated setAppPeriod tail")

# -----------------------------------------------------------------------------
# 3. Make Tasks search and filters sticky
# -----------------------------------------------------------------------------
# Find the filter area before tasksFullScreenContainerList
search_box_start = html.find('<!-- حقل البحث السريع -->')
if search_box_start != -1:
    filter_tabs_start = html.rfind('<!-- أشرطة التصفية السريعة والبحث وفلتر الأفراد -->', 0, search_box_start)
    if filter_tabs_start != -1:
        list_container_start = html.find('id="tasksFullScreenContainerList"', search_box_start)
        # find the div opening before list_container_start
        div_before_list = html.rfind('<div', filter_tabs_start, list_container_start)
        
        filter_section_html = html[filter_tabs_start:div_before_list]
        wrapped_filter_section = f'''<!-- شريط الفلاتر والبحث المثبت أثناء التمرير في كل طرق العرض -->
        <div class="tasks-sticky-filter-wrapper" style="position: sticky; top: 50px; z-index: 85; background: rgba(11, 19, 41, 0.96); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); padding: 8px 0; border-bottom: 1.2px solid rgba(168, 85, 247, 0.3); display: flex; flex-direction: column; gap: 8px;">
          {filter_section_html}
        </div>\n\n        '''
        html = html[:filter_tabs_start] + wrapped_filter_section + html[div_before_list:]
        print("✓ Successfully made Tasks search and filters sticky")

# -----------------------------------------------------------------------------
# 4. Make Indicators / Analytics Control Panel sticky
# -----------------------------------------------------------------------------
html = html.replace(
    'class="analytics-control-panel" style="margin: 0 8px 10px; background: rgba(15, 23, 42, 0.9);',
    'class="analytics-control-panel" style="position: sticky; top: 0px; z-index: 60; margin: 0 8px 10px; background: rgba(15, 23, 42, 0.96); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);'
)
print("✓ Successfully made Analytics control panel sticky")

# -----------------------------------------------------------------------------
# 5. Write updated index.html
# -----------------------------------------------------------------------------
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Saved all index.html updates successfully.")

import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Header: move notifications to far right, next search, then tasks
target_header = """      <!-- السطر 1: شريط البراند والمهام (يمين) + عدسة البحث والتنبيهات والمزامنة والضبط (يسار) بتناسق فائق -->
      <div class="header-brand-row" style="display: flex; justify-content: space-between; align-items: center; gap: 6px; width: 100%; box-sizing: border-box; flex-wrap: nowrap;">
        <!-- كتلة اليمين (زر المهام الرئيسي) -->
        <div class="brand-box" style="display: flex; align-items: center; gap: 5px; flex-shrink: 0;">
          <!-- زر المهام الرئيسي -->
          <button type="button" class="header-tasks-main-btn" id="btnHeaderTasksTop" onclick="openTasksFullScreenModal()" title="عرض وإدارة المهام والمخطط اليومي" style="height: 32px; padding: 0 9px; border-radius: 9px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.28), rgba(99, 102, 241, 0.28)); border: 1.2px solid rgba(168, 85, 247, 0.55); color: #f8fafc; font-size: 0.74rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.25); transition: all 0.2s; white-space: nowrap;">
            <i class="fa-solid fa-list-check" style="color: #c084fc; font-size: 0.82rem;"></i>
            <span>المهام</span>
            <span id="headerTasksBadgeCount" style="background: #a855f7; color: #ffffff; font-size: 0.60rem; padding: 1px 5px; border-radius: 8px; font-weight: 900;">0</span>
          </button>
        </div>

        <!-- أزرار الإجراءات السريعة (عدسة البحث + تنبيهات + مزامنة + ضبط) بتناسق تام -->
        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
          <!-- استعادة عدسة البحث الشامل -->
          <button class="header-settings-btn" id="btnGlobalSearch" onclick="openGlobalSearchModal()" title="البحث الشامل في البرنامج" style="background: rgba(56, 189, 248, 0.16); border: 1.2px solid rgba(56, 189, 248, 0.45); color: #38bdf8; height: 32px; padding: 0 8px; border-radius: 9px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; font-weight: 850; transition: all 0.2s; white-space: nowrap;">
            <i class="fa-solid fa-magnifying-glass" style="font-size: 0.76rem;"></i>
            <span>بحث</span>
          </button>
          <!-- زر التنبيهات -->
          <button class="header-settings-btn" id="btnNotificationsBell" onclick="openNotificationsModal()" title="الإشعارات والتنبيهات الذكية" style="position: relative; background: rgba(245, 158, 11, 0.18); border: 1.2px solid rgba(245, 158, 11, 0.45); color: #fbbf24; height: 32px; padding: 0 7px; border-radius: 9px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-size: 0.70rem; font-weight: 800;">
            <i class="fa-solid fa-bell"></i>
            <span id="headerNotifBadge" class="notif-badge-dot" style="position: absolute; top: 3px; right: 3px; width: 6px; height: 6px; background: #ef4444; border-radius: 50%; border: 1px solid #0f172a; display: inline-block;"></span>
            <span>تنبيهات</span>
          </button>

          <!-- زر المزامنة والتحديث المدمج الشامل -->
          <button class="header-settings-btn header-master-sync-btn" id="btnHeaderMasterSync" onclick="executeMasterUnifiedSyncAndRefresh(true)" title="تحديث شامل وموازنة الأرصدة والذهب" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.20), rgba(2, 132, 199, 0.20)); border: 1.2px solid rgba(56, 189, 248, 0.45); color: #38bdf8; font-weight: 850; display: inline-flex; align-items: center; gap: 4px; height: 32px; padding: 0 8px; border-radius: 9px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);">
            <i class="fa-solid fa-arrows-rotate master-sync-icon-spin" id="headerMasterSyncSpinIcon" style="font-size: 0.74rem; color: #34d399;"></i>
            <span id="topDriveSyncStatusText" style="font-size: 0.70rem; font-weight: 900; color: #34d399;">محدث</span>
          </button>

          <!-- زر الضبط والإعدادات الرئيسي - واضح وبارز وبدون أي حجب أو تداخل -->
          <button class="header-settings-btn" id="btnMainSettings" onclick="openSettingsModal()" title="مركز الضبط والمزامنة" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.2px solid rgba(56, 189, 248, 0.45); color: #f8fafc; font-weight: 850; display: inline-flex; align-items: center; gap: 4px; height: 32px; padding: 0 9px; border-radius: 9px; cursor: pointer; transition: all 0.2s ease; z-index: 10;">
            <i class="fa-solid fa-sliders" style="color: #38bdf8; font-size: 0.78rem;"></i>
            <span>الضبط</span>
          </button>
        </div>
      </div>"""

replacement_header = """      <!-- السطر 1: أقصى يمين الشاشة (تنبيهات ثم بحث ثم مهام) ويسار الشاشة (مزامنة + ضبط) بتناسق تام -->
      <div class="header-brand-row" style="display: flex; justify-content: space-between; align-items: center; gap: 6px; width: 100%; box-sizing: border-box; flex-wrap: nowrap;">
        <!-- كتلة أقصى يمين الشاشة: تنبيهات ثم بحث ثم مهام (بناءً على طلب المستخدم) -->
        <div class="brand-box" style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
          <!-- 1. زر التنبيهات (أقصى يمين الشاشة) -->
          <button class="header-settings-btn" id="btnNotificationsBell" onclick="openNotificationsModal()" title="الإشعارات والتنبيهات الذكية" style="position: relative; background: rgba(245, 158, 11, 0.18); border: 1.2px solid rgba(245, 158, 11, 0.45); color: #fbbf24; height: 32px; padding: 0 7px; border-radius: 9px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-size: 0.70rem; font-weight: 800; white-space: nowrap;">
            <i class="fa-solid fa-bell"></i>
            <span id="headerNotifBadge" class="notif-badge-dot" style="position: absolute; top: 3px; right: 3px; width: 6px; height: 6px; background: #ef4444; border-radius: 50%; border: 1px solid #0f172a; display: inline-block;"></span>
            <span>تنبيهات</span>
          </button>

          <!-- 2. زر البحث (بجانب التنبيهات) -->
          <button class="header-settings-btn" id="btnGlobalSearch" onclick="openGlobalSearchModal()" title="البحث الشامل في البرنامج" style="background: rgba(56, 189, 248, 0.16); border: 1.2px solid rgba(56, 189, 248, 0.45); color: #38bdf8; height: 32px; padding: 0 8px; border-radius: 9px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; font-weight: 850; transition: all 0.2s; white-space: nowrap;">
            <i class="fa-solid fa-magnifying-glass" style="font-size: 0.76rem;"></i>
            <span>بحث</span>
          </button>

          <!-- 3. زر المهام الرئيسي (ثم المهام) -->
          <button type="button" class="header-tasks-main-btn" id="btnHeaderTasksTop" onclick="openTasksFullScreenModal()" title="عرض وإدارة المهام والمخطط اليومي" style="height: 32px; padding: 0 8px; border-radius: 9px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.28), rgba(99, 102, 241, 0.28)); border: 1.2px solid rgba(168, 85, 247, 0.55); color: #f8fafc; font-size: 0.74rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.25); transition: all 0.2s; white-space: nowrap;">
            <i class="fa-solid fa-list-check" style="color: #c084fc; font-size: 0.82rem;"></i>
            <span>المهام</span>
            <span id="headerTasksBadgeCount" style="background: #a855f7; color: #ffffff; font-size: 0.60rem; padding: 1px 5px; border-radius: 8px; font-weight: 900;">0</span>
          </button>
        </div>

        <!-- كتلة أقصى يسار الشاشة: المزامنة والضبط -->
        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
          <!-- زر المزامنة والتحديث المدمج الشامل -->
          <button class="header-settings-btn header-master-sync-btn" id="btnHeaderMasterSync" onclick="executeMasterUnifiedSyncAndRefresh(true)" title="تحديث شامل وموازنة الأرصدة والذهب" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.20), rgba(2, 132, 199, 0.20)); border: 1.2px solid rgba(56, 189, 248, 0.45); color: #38bdf8; font-weight: 850; display: inline-flex; align-items: center; gap: 4px; height: 32px; padding: 0 8px; border-radius: 9px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25); white-space: nowrap;">
            <i class="fa-solid fa-arrows-rotate master-sync-icon-spin" id="headerMasterSyncSpinIcon" style="font-size: 0.74rem; color: #34d399;"></i>
            <span id="topDriveSyncStatusText" style="font-size: 0.70rem; font-weight: 900; color: #34d399;">محدث</span>
          </button>

          <!-- زر الضبط والإعدادات الرئيسي - واضح وبارز وبدون أي حجب أو تداخل -->
          <button class="header-settings-btn" id="btnMainSettings" onclick="openSettingsModal()" title="مركز الضبط والمزامنة" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.2px solid rgba(56, 189, 248, 0.45); color: #f8fafc; font-weight: 850; display: inline-flex; align-items: center; gap: 4px; height: 32px; padding: 0 9px; border-radius: 9px; cursor: pointer; transition: all 0.2s ease; z-index: 10; white-space: nowrap;">
            <i class="fa-solid fa-sliders" style="color: #38bdf8; font-size: 0.78rem;"></i>
            <span>الضبط</span>
          </button>
        </div>
      </div>"""

if target_header in content:
    content = content.replace(target_header, replacement_header, 1)
    print("Header successfully re-ordered: Notifications -> Search -> Tasks -> (Sync + Settings)!")
else:
    print("WARNING: target_header not found exactly!")

# 2. Remove "صافي السيولة المعتمدة للمحافظ" and increase hero-value styling in HTML
target_hero = """            <div class="cockpit-hero-value" id="topCardBalance" style="font-size: clamp(1.15rem, 3.8vw, 1.60rem); font-weight: 950; letter-spacing: -0.3px; text-shadow: 0 2px 18px rgba(56, 189, 248, 0.65); margin: auto 0; color: #38bdf8; max-width: 100%; overflow: visible;">+ 0.00 ج.م</div>
            <div class="hero-liquidity-subtitle" style="font-size: clamp(0.58rem, 1.8vw, 0.66rem); color: #94a3b8; display: flex; align-items: center; gap: 4px; margin-top: 1px;">
              <i class="fa-solid fa-shield-halved" style="color: #34d399; font-size: 0.72rem;"></i>
              <span>صافي السيولة المعتمدة للمحافظ</span>
            </div>"""

replacement_hero = """            <div class="cockpit-hero-value" id="topCardBalance" style="font-size: clamp(1.42rem, 4.8vw, 1.90rem); font-weight: 950; letter-spacing: -0.3px; text-shadow: 0 2px 20px rgba(56, 189, 248, 0.70); margin: auto 0; color: #38bdf8; max-width: 100%; overflow: visible; line-height: 1.15;">+ 0.00 ج.م</div>"""

if target_hero in content:
    content = content.replace(target_hero, replacement_hero, 1)
    print("صافي السيولة المعتمدة للمحافظ removed and topCardBalance increased in HTML!")
else:
    print("WARNING: target_hero not found exactly!")

# 3. Update CSS rules for .cockpit-hero-value and .flow-amount
# In the latest CSS block around lines 11277-11400:
old_css_block = """    .cockpit-hero-value {
      font-size: clamp(1.15rem, 3.8vw, 1.60rem);
      font-weight: 950 !important;
      color: #38bdf8 !important;
      letter-spacing: -0.3px !important;
      direction: rtl !important;
      text-align: right !important;
      font-variant-numeric: tabular-nums !important;
      line-height: 1.15 !important;
      white-space: nowrap !important;
      text-shadow: 0 2px 18px rgba(56, 189, 248, 0.65) !important;
      max-width: 100% !important;
      overflow: visible !important;
    }"""

new_css_block = """    .cockpit-hero-value {
      font-size: clamp(1.42rem, 4.8vw, 1.90rem) !important;
      font-weight: 950 !important;
      color: #38bdf8 !important;
      letter-spacing: -0.3px !important;
      direction: rtl !important;
      text-align: right !important;
      font-variant-numeric: tabular-nums !important;
      line-height: 1.15 !important;
      white-space: nowrap !important;
      text-shadow: 0 2px 20px rgba(56, 189, 248, 0.70) !important;
      max-width: 100% !important;
      overflow: visible !important;
    }"""

content = content.replace(old_css_block, new_css_block)
print("Updated .cockpit-hero-value CSS occurrences!")

# Update .flow-amount CSS
old_flow_css = """    .flow-amount {
      font-size: clamp(0.78rem, 2.4vw, 0.94rem) !important;
      font-weight: 950 !important;
      direction: rtl !important;
      font-variant-numeric: tabular-nums !important;
      letter-spacing: -0.3px !important;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4) !important;
    }"""

new_flow_css = """    .flow-amount {
      font-size: clamp(0.96rem, 3.0vw, 1.18rem) !important;
      font-weight: 950 !important;
      direction: rtl !important;
      font-variant-numeric: tabular-nums !important;
      letter-spacing: -0.3px !important;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.45) !important;
      line-height: 1.1 !important;
    }"""

content = content.replace(old_flow_css, new_flow_css)
print("Updated .flow-amount CSS occurrences!")

# Also check single-line .flow-amount
old_single_flow = ".flow-amount { font-weight: 950 !important; font-variant-numeric: tabular-nums !important; direction: rtl !important; font-size: clamp(0.78rem, 2.4vw, 0.94rem) !important;"
new_single_flow = ".flow-amount { font-weight: 950 !important; font-variant-numeric: tabular-nums !important; direction: rtl !important; font-size: clamp(0.96rem, 3.0vw, 1.18rem) !important; line-height: 1.1 !important;"
content = content.replace(old_single_flow, new_single_flow)

# 4. Update JS dynamic scaling logic for elBal and add elInc/elExp scaling
old_js_scale = """        // تحجيم ذكي للأرقام الكبيرة حتى لا تتجاوز حدود البطاقة نهائياً وبدون أي نقاط اختصار (...)
        const balStr = elBal.textContent || '';
        if (balStr.length > 22) {
          elBal.style.setProperty('font-size', 'clamp(0.88rem, 2.7vw, 1.05rem)', 'important');
          elBal.style.letterSpacing = '-0.5px';
        } else if (balStr.length > 15) {
          elBal.style.setProperty('font-size', 'clamp(1.02rem, 3.2vw, 1.22rem)', 'important');
          elBal.style.letterSpacing = '-0.3px';
        } else if (balStr.length > 10) {
          elBal.style.setProperty('font-size', 'clamp(1.15rem, 3.6vw, 1.38rem)', 'important');
          elBal.style.letterSpacing = '-0.2px';
        } else {
          elBal.style.setProperty('font-size', 'clamp(1.25rem, 4.0vw, 1.55rem)', 'important');
          elBal.style.letterSpacing = '-0.1px';
        }"""

new_js_scale = """        // تحجيم ذكي للأرقام الكبيرة حتى تكون أكبر وأبرز ولا تتجاوز حدود البطاقة نهائياً
        const balStr = elBal.textContent || '';
        if (balStr.length > 22) {
          elBal.style.setProperty('font-size', 'clamp(1.00rem, 3.2vw, 1.25rem)', 'important');
          elBal.style.letterSpacing = '-0.5px';
        } else if (balStr.length > 16) {
          elBal.style.setProperty('font-size', 'clamp(1.18rem, 3.8vw, 1.45rem)', 'important');
          elBal.style.letterSpacing = '-0.3px';
        } else if (balStr.length > 11) {
          elBal.style.setProperty('font-size', 'clamp(1.32rem, 4.2vw, 1.65rem)', 'important');
          elBal.style.letterSpacing = '-0.2px';
        } else {
          elBal.style.setProperty('font-size', 'clamp(1.45rem, 4.8vw, 1.90rem)', 'important');
          elBal.style.letterSpacing = '-0.2px';
        }

        // تحجيم ذكي لكبسولتي الإيداعات والمصروفات لتكون أرقامها أكبر وأبرز دون أي خروج عن الكارت
        function scaleFlowAmountPill(el) {
          if (!el) return;
          const s = el.textContent || '';
          if (s.length > 18) {
            el.style.setProperty('font-size', 'clamp(0.78rem, 2.4vw, 0.90rem)', 'important');
          } else if (s.length > 14) {
            el.style.setProperty('font-size', 'clamp(0.86rem, 2.7vw, 1.02rem)', 'important');
          } else {
            el.style.setProperty('font-size', 'clamp(0.96rem, 3.0vw, 1.18rem)', 'important');
          }
        }
        scaleFlowAmountPill(elInc);
        scaleFlowAmountPill(elExp);"""

if old_js_scale in content:
    content = content.replace(old_js_scale, new_js_scale, 1)
    print("JS dynamic scaling logic updated for elBal, elInc, and elExp!")
else:
    print("WARNING: old_js_scale not found exactly!")

# 5. Version bump to v5.3.0
content = content.replace("var APP_VERSION = 'v5.2.9';", "var APP_VERSION = 'v5.3.0';")
content = content.replace("var APP_BUILD_ID = 202611090940;", "var APP_BUILD_ID = 202611091020;")
content = content.replace("window.APP_VERSION = 'v5.2.9';", "window.APP_VERSION = 'v5.3.0';")
content = content.replace("window.APP_BUILD_ID = 202611090940;", "window.APP_BUILD_ID = 202611091020;")
content = content.replace("const APP_VERSION = 'v5.2.9';", "const APP_VERSION = 'v5.3.0';")
content = content.replace("const APP_BUILD_ID = 202611090940;", "const APP_BUILD_ID = 202611091020;")
content = content.replace("v5.2.9 • متزامن", "v5.3.0 • متزامن")
content = content.replace("(v5.2.9)", "(v5.3.0)")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied all changes and bumped to v5.3.0!")

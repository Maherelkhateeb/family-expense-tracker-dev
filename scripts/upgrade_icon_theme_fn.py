import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_set_icon = """function setAppIconTheme(iconTheme, persist = true) {
      const validThemes = [
        'vibrant', 'gold', 'emerald', 'ocean', 'purple', 'silver',
        'ruby', 'amber', 'cyber', 'teal', 'indigo', 'rose'
      ];
      if (!validThemes.includes(iconTheme)) iconTheme = 'vibrant';

      state.iconTheme = iconTheme;
      document.documentElement.setAttribute('data-icon-theme', iconTheme);
      document.body.setAttribute('data-icon-theme', iconTheme);

      if (persist) {
        try { localStorage.setItem('family_monefy_icon_theme', iconTheme); } catch(e) {}
      }

      const opts = [
        'Vibrant', 'Gold', 'Emerald', 'Ocean', 'Purple', 'Silver',
        'Ruby', 'Amber', 'Cyber', 'Teal', 'Indigo', 'Rose'
      ];
      opts.forEach(o => {
        const el = document.getElementById('iconThemeOpt' + o);
        if (el) {
          if (o.toLowerCase() === iconTheme) {
            el.classList.add('active');
            el.style.setProperty('border', '1.8px solid #38bdf8', 'important');
            el.style.setProperty('box-shadow', '0 0 12px rgba(56, 189, 248, 0.45)', 'important');
          } else {
            el.classList.remove('active');
            el.style.border = '1.2px solid rgba(255, 255, 255, 0.1)';
            el.style.boxShadow = 'none';
          }
        }
      });

      const names = {
        'vibrant': 'ملون فينتك',
        'gold': 'ذهبي متوهج',
        'emerald': 'زمردي نيون',
        'ocean': 'سماوي بحري',
        'purple': 'ياقوتي ملكي',
        'silver': 'بلاتيني فضي',
        'ruby': 'روبي قرمزي',
        'amber': 'عنبر كهرماني',
        'cyber': 'سايبر نيون',
        'teal': 'تيل ملكي',
        'indigo': 'نيلي ليزري',
        'rose': 'وردي زهري'
      };

      const badge = document.getElementById('activeIconThemeBadge');
      if (badge) badge.textContent = names[iconTheme] || iconTheme;

      // تحديث فوري للمتغيرات وشبكة المصروفات وكافة الأيقونات
      const paletteColors = {
        'gold': '#fbbf24', 'emerald': '#34d399', 'ocean': '#22d3ee',
        'purple': '#c084fc', 'silver': '#e2e8f0', 'ruby': '#fb7185',
        'amber': '#fb923c', 'cyber': '#a3e635', 'teal': '#2dd4bf',
        'indigo': '#818cf8', 'rose': '#f472b6', 'vibrant': '#38bdf8'
      };
      const activeColor = paletteColors[iconTheme] || '#38bdf8';
      document.documentElement.style.setProperty('--app-active-icon-color', activeColor);
      
      const catGrid = document.getElementById('catGrid');
      if (catGrid) catGrid.dataset.iconTheme = ''; // Force re-render

      try {
        if (typeof renderUI === 'function') renderUI();
      } catch(e) {}

      if (persist && typeof showToast === 'function') {
        showToast(`✨ تم تفعيل نمط ألوان الأيقونات: ${names[iconTheme] || iconTheme}`);
      }
    }"""

new_set_icon = """function setAppIconTheme(iconTheme, persist = true) {
      const validThemes = [
        'vibrant', 'gold', 'emerald', 'ocean', 'purple', 'silver',
        'ruby', 'amber', 'cyber', 'teal', 'indigo', 'rose'
      ];
      if (!validThemes.includes(iconTheme)) iconTheme = 'vibrant';

      state.iconTheme = iconTheme;
      document.documentElement.setAttribute('data-icon-theme', iconTheme);
      document.body.setAttribute('data-icon-theme', iconTheme);

      if (persist) {
        try { localStorage.setItem('family_monefy_icon_theme', iconTheme); } catch(e) {}
      }

      const paletteColors = {
        'vibrant': '#38bdf8',
        'gold': '#fbbf24',
        'emerald': '#34d399',
        'ocean': '#22d3ee',
        'purple': '#c084fc',
        'silver': '#e2e8f0',
        'ruby': '#fb7185',
        'amber': '#fb923c',
        'cyber': '#a3e635',
        'teal': '#2dd4bf',
        'indigo': '#818cf8',
        'rose': '#f472b6'
      };
      const activeColor = paletteColors[iconTheme] || '#38bdf8';
      document.documentElement.style.setProperty('--app-active-icon-color', activeColor);

      const names = {
        'vibrant': 'ملون فينتك',
        'gold': 'ذهبي متوهج',
        'emerald': 'زمردي نيون',
        'ocean': 'سماوي بحري',
        'purple': 'ياقوتي ملكي',
        'silver': 'بلاتيني فضي',
        'ruby': 'روبي قرمزي',
        'amber': 'عنبر كهرماني',
        'cyber': 'سايبر نيون',
        'teal': 'تيل ملكي',
        'indigo': 'نيلي ليزري',
        'rose': 'وردي زهري'
      };

      const opts = [
        'Vibrant', 'Gold', 'Emerald', 'Ocean', 'Purple', 'Silver',
        'Ruby', 'Amber', 'Cyber', 'Teal', 'Indigo', 'Rose'
      ];
      opts.forEach(o => {
        const el = document.getElementById('iconThemeOpt' + o);
        if (el) {
          const optKey = o.toLowerCase();
          const optColor = paletteColors[optKey] || '#38bdf8';
          if (optKey === iconTheme) {
            el.classList.add('active');
            el.style.setProperty('border', `2px solid ${optColor}`, 'important');
            el.style.setProperty('box-shadow', `0 0 14px ${optColor}80, inset 0 0 8px ${optColor}33`, 'important');
            el.style.setProperty('background', `${optColor}1a`, 'important');
            el.style.setProperty('transform', 'translateY(-2px) scale(1.04)', 'important');
          } else {
            el.classList.remove('active');
            el.style.setProperty('border', '1.2px solid rgba(255, 255, 255, 0.1)', 'important');
            el.style.setProperty('box-shadow', 'none', 'important');
            el.style.setProperty('background', 'rgba(255, 255, 255, 0.02)', 'important');
            el.style.setProperty('transform', 'none', 'important');
          }
        }
      });

      const badge = document.getElementById('activeIconThemeBadge');
      if (badge) {
        badge.textContent = names[iconTheme] || iconTheme;
        badge.style.setProperty('border', `1.5px solid ${activeColor}`, 'important');
        badge.style.setProperty('color', activeColor, 'important');
        badge.style.setProperty('box-shadow', `0 0 10px ${activeColor}40`, 'important');
      }

      const catGrid = document.getElementById('catGrid');
      if (catGrid) catGrid.dataset.iconTheme = ''; // Force re-render

      try {
        if (typeof renderUI === 'function') renderUI();
      } catch(e) {}

      if (persist && typeof showToast === 'function') {
        showToast(`✨ تم تفعيل نمط ألوان الأيقونات: ${names[iconTheme] || iconTheme}`);
      }
    }"""

if old_set_icon in content:
    content = content.replace(old_set_icon, new_set_icon)
    print("Successfully upgraded setAppIconTheme with matching active colors & glowing effects!")
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
else:
    print("Warning: old_set_icon not matched!")

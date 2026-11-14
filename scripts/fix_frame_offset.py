import sys

filepath = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

fix_css = '''
    /* حماية صارمة لمنع تمدد شعار العائلة أو خروج إطار التطبيق عن الشاشة */
    body {
      overflow-x: hidden !important;
      width: 100% !important;
      max-width: 100vw !important;
      margin: 0 auto !important;
      justify-content: center !important;
      align-items: center !important;
    }
    .mobile-frame, #appFrame {
      margin: 0 auto !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      max-width: 480px !important;
      overflow-x: hidden !important;
    }
    .brand-icon {
      width: 36px !important;
      height: 36px !important;
      min-width: 36px !important;
      min-height: 36px !important;
      max-width: 36px !important;
      max-height: 36px !important;
      border-radius: 12px !important;
      overflow: hidden !important;
      flex-shrink: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .brand-icon img, #headerBrandFamilyLogo {
      width: 36px !important;
      height: 36px !important;
      max-width: 36px !important;
      max-height: 36px !important;
      object-fit: cover !important;
      border-radius: 12px !important;
      display: block !important;
    }
'''

content = content.replace('</head>', fix_css + '\n</head>', 1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Applied header logo fix and mobile frame centering!')

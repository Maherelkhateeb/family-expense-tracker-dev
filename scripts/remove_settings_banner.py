#!/usr/bin/env python3
"""
Remove verbose/banner elements from Settings modal:
1. The top audit banner button "موازنة وتدقيق الأرصدة والمحافظ"
2. Any verbose explanation paragraphs in sync/theme sections
"""
import re, sys
sys.stdout.reconfigure(encoding='utf-8')

path = 'index.html'
content = open(path, encoding='utf-8').read()
original_len = len(content)

changes = []

# ── 1. Remove the top audit banner button (and surrounding comments) ──────────
# Target: the two comment lines + the button element
old_banner = '''        <!-- زر موازنة وتدقيق الأرصدة والمحافظ -->
                <!-- زر موازنة وتدقيق الأرصدة والمحافظ -->
        <button type="button" onclick="runInstantSettingsAudit()" style="width: 100%; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #0284c7, #0ea5e9); border: none; color: #fff; font-size: 0.82rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 10px rgba(2, 132, 199, 0.35); margin: 2px 0 6px;">
          <i class="fa-solid fa-scale-balanced" style="font-size: 0.95rem;"></i>
          <span>موازنة وتدقيق الأرصدة والمحافظ</span>
        </button>'''

if old_banner in content:
    content = content.replace(old_banner, '')
    changes.append('✓ Removed audit banner button')
else:
    # Try flexible regex
    pattern = r'\s*<!--[^>]*زر موازنة وتدقيق[^>]*-->[\s\S]*?</button>'
    m = re.search(pattern, content)
    if m:
        content = content[:m.start()] + content[m.end():]
        changes.append('✓ Removed audit banner button (regex)')
    else:
        changes.append('⚠ Audit banner button NOT found')

# ── 2. Remove any verbose explanation paragraph/div under master sync card ─────
# Pattern: a small-text explanation inside the sync card (if exists)
patterns_to_remove = [
    # verbose description paragraph
    r'<p\s[^>]*>\s*زر موحد وذكي[^<]*</p>',
    r'<div\s[^>]*>\s*زر موحد وذكي[\s\S]*?</div>',
    # any subtitle span with explanation
    r'<span\s[^>]*font-size:\s*0\.7[^>]*>\s*(?:يقوم بكل|نقرة واحدة|مزامنة بيانات Google|سحب|تنزيل وتطبيق)[^<]*</span>',
]
for pat in patterns_to_remove:
    before = len(content)
    content = re.sub(pat, '', content)
    if len(content) < before:
        changes.append(f'✓ Removed verbose text via regex: {pat[:50]}')

# ── 3. Remove any verbose preview board button ────────────────────────────────
preview_patterns = [
    r'<button[^>]*>\s*<[^>]*>\s*</[^>]*>\s*لوحة معاينة واختبار خلفيات التطبيق[^<]*</button>',
    r'<button[^>]*لوحة معاينة[^>]*>[\s\S]*?</button>',
]
for pat in preview_patterns:
    before = len(content)
    content = re.sub(pat, '', content)
    if len(content) < before:
        changes.append(f'✓ Removed theme preview button')

# ── Write back ─────────────────────────────────────────────────────────────────
open(path, 'w', encoding='utf-8').write(content)
print(f'Original size: {original_len:,} bytes')
print(f'New size:      {len(content):,} bytes')
print(f'Removed:       {original_len - len(content):,} bytes')
print()
for c in changes:
    print(c)

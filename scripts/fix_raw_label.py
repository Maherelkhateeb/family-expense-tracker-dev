import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    c = f.read()

# Fix 1: item.title
c = c.replace('title="${escapeHtml(rawLabel)}">\n                  ${escapeHtml(item.title || typeName)}',
              'title="${escapeHtml(item.title || typeName)}">\n                  ${escapeHtml(item.title || typeName)}')

# Fix 2: b.title
c = c.replace('title="${escapeHtml(rawLabel)}">\n                    ${escapeHtml(b.title || b.label || \'فاتورة مستحقة\')}',
              'title="${escapeHtml(b.title || b.label || \'فاتورة مستحقة\')}">\n                    ${escapeHtml(b.title || b.label || \'فاتورة مستحقة\')}')

# Fix 3: d.title
c = c.replace('title="${escapeHtml(rawLabel)}">\n                    ${escapeHtml(d.title || d.label || \'دين مستحق\')}',
              'title="${escapeHtml(d.title || d.label || \'دين مستحق\')}">\n                    ${escapeHtml(d.title || d.label || \'دين مستحق\')}')

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "w", encoding="utf-8") as f:
    f.write(c)

print("Fixed rawLabel references in commitments list")

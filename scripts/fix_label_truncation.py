import sys

sys.stdout.reconfigure(encoding='utf-8')

FILE_PATH = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

with open(FILE_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace in flat mode
old_flat = '<div style="font-size: 0.88rem; font-weight: 850; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(rawLabel)}">'
new_flat = '<div style="font-size: 0.88rem; font-weight: 850; color: #f8fafc; line-height: 1.35; word-break: break-word;" title="${escapeHtml(rawLabel)}">'

# Replace in daily mode
old_daily = '<div style="font-size: 0.88rem; font-weight: 850; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">'
new_daily = '<div style="font-size: 0.88rem; font-weight: 850; color: #f8fafc; line-height: 1.35; word-break: break-word;" title="${escapeHtml(rawLabel)}">'

cnt1 = content.count(old_flat)
cnt2 = content.count(old_daily)
print(f"Found {cnt1} occurrences of old_flat, {cnt2} occurrences of old_daily")

content = content.replace(old_flat, new_flat)
content = content.replace(old_daily, new_daily)

with open(FILE_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated label styling successfully.")

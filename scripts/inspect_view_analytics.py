with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

analytics_lines = lines[12299:12700]
with open('scripts/view_analytics_preview.html', 'w', encoding='utf-8') as f_out:
    f_out.writelines(analytics_lines)

print("Saved viewAnalytics preview to scripts/view_analytics_preview.html")

import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

s = 559093
# Let's see what is at 600000, 700000, etc.
# Find the next major container like <nav or <footer or <!-- modal
next_markers = [html.find(x, s) for x in ['<nav class="app-bottom-nav"', '<footer', '<!-- =========================================================================\n         نوافذ']]
next_markers = [x for x in next_markers if x != -1]
print("Next major markers after viewExpected:", next_markers)
if next_markers:
    end_view = min(next_markers)
    print(f"viewExpected ends at approx: {end_view}")
    print(html[end_view-200:end_view+100])

import subprocess

cmd = 'git show 4e86e37:index.html'
p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE)
text = p.communicate()[0].decode('utf-8', errors='ignore')

pos = text.find('async function checkAndApplyAppUpdates')
pos_end = text.find('// دوال التوافق السريع', pos)

with open('scripts/old_check_update.js', 'w', encoding='utf-8') as f:
    f.write(text[pos:pos_end])

print("Saved to scripts/old_check_update.js")

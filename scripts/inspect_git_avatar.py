import subprocess
import sys
sys.stdout.reconfigure(encoding='utf-8')

# Search git log for mentions of avatar or family or logo in header
res = subprocess.run(['git', 'log', '-S', 'avatar-photo-img', '--oneline'], cwd='C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy', capture_output=True, text=True)
print("Git log -S avatar-photo-img:\n", res.stdout)

res2 = subprocess.run(['git', 'log', '-S', 'avatarImgAllFamily', '--oneline'], cwd='C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy', capture_output=True, text=True)
print("Git log -S avatarImgAllFamily:\n", res2.stdout)

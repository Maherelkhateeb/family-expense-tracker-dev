import base64
import os
from playwright.sync_api import sync_playwright

vpath = r'C:\Users\96656\.gemini\antigravity\brain\58178b48-49fb-4253-bc06-babef91730ae\.user_uploaded\media_1795005211218_6a760bd7.mp4'
outdir = r'C:\Users\96656\.gemini\antigravity\brain\58178b48-49fb-4253-bc06-babef91730ae\video3_frames'
os.makedirs(outdir, exist_ok=True)

with open(vpath, 'rb') as f:
    vbytes = f.read()

b64 = base64.b64encode(vbytes).decode('ascii')
data_uri = f'data:video/mp4;base64,{b64}'

html = f'''
<!DOCTYPE html>
<html>
<head><style>body,html{{margin:0;padding:0;background:#000;overflow:hidden;}} video{{width:100vw;height:100vh;object-fit:contain;}}</style></head>
<body>
<video id="v" src="{data_uri}" muted playsinline></video>
</body>
</html>
'''

html_path = os.path.join(outdir, 'player.html')
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page(viewport={'width': 600, 'height': 950})
    page.goto(f'file:///{html_path.replace(os.sep, "/")}')
    page.wait_for_selector('video')
    
    duration = page.evaluate('() => new Promise(r => { const v = document.getElementById("v"); if(v.duration) r(v.duration); v.onloadedmetadata = () => r(v.duration); })')
    print('Video duration:', duration)
    
    # Capture 14 frames across the video
    num_frames = 14
    for i in range(num_frames):
        t = (duration / (num_frames + 1)) * (i + 1)
        page.evaluate(f'''() => new Promise(r => {{
            const v = document.getElementById("v");
            v.currentTime = {t};
            v.onseeked = () => r();
        }})''')
        page.wait_for_timeout(250)
        shot_path = os.path.join(outdir, f'frame_{i:02d}.png')
        page.screenshot(path=shot_path)
        print(f'Captured frame {i} at t={t:.2f}s -> {shot_path}')
        
    browser.close()

print('Done extracting video3 frames!')

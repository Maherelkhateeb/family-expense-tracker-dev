# scripts/debug_settings_deep.py
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect updateSettingsModalDisplay
pos = text.find('function updateSettingsModalDisplay')
print("updateSettingsModalDisplay definition:")
print(text[pos:pos+1500])

# Let's check where btnMainSettings is defined
pos_btn = text.find('id="btnMainSettings"')
print("\nbtnMainSettings definition:")
print(text[pos_btn-100:pos_btn+300])

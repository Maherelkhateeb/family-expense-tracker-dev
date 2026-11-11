# scripts/find_cal_init.py
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = 1793770
print(text[pos-200:pos+800])

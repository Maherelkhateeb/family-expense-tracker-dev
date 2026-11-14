import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_net = 'netValue.innerHTML = `<span style="color: ${netColor}; direction: rtl; display: inline-flex; align-items: center; gap: 4px;">${netSign} ${formatMoneyVal(Math.abs(netCommitmentsToPrepare))} <span style="font-size: 0.74rem;">${curr}</span></span>`;'
new_net = 'netValue.innerHTML = `<span style="color: ${netColor}; direction: rtl; display: inline-flex; align-items: center; gap: 4px;">${netSign} ${formatMoneyVal(Math.abs(netCommitmentsToPrepare))}</span>`;'

if old_net in content:
    content = content.replace(old_net, new_net, 1)
    print("Fixed currency duplication in netValue.")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved index.html.")

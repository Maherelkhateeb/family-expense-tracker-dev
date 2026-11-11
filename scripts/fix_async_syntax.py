import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace checkAndApplyAppUpdates with clean async function
text = text.replace(
    'function checkAndApplyAppUpdates(options = { isManual: false, silent: true }) {',
    'async function checkAndApplyAppUpdates(options = { isManual: false, silent: true }) {'
)
text = text.replace('return (async () => {', '')
text = text.replace('})();\n    }\n\n    async function executeMasterUnifiedSyncAndRefresh', '}\n\n    async function executeMasterUnifiedSyncAndRefresh')

# Ensure orchestrateAppStartupRefresh is async
text = text.replace(
    'function orchestrateAppStartupRefresh(isForce = false) {',
    'async function orchestrateAppStartupRefresh(isForce = false) {'
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated checkAndApplyAppUpdates and orchestrateAppStartupRefresh to clean async functions.")

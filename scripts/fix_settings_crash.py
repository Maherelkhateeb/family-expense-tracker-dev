with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Guard auditAndRecomputeAllWalletBalances calls at 1231470 and 1381594
target1 = "auditAndRecomputeAllWalletBalances();\n      } else"
rep1 = "if (typeof auditAndRecomputeAllWalletBalances === 'function') auditAndRecomputeAllWalletBalances();\n      } else"
text = text.replace(target1, rep1)

target2 = "auditAndRecomputeAllWalletBalances();\n      state.wallets"
rep2 = "if (typeof auditAndRecomputeAllWalletBalances === 'function') auditAndRecomputeAllWalletBalances();\n      state.wallets"
text = text.replace(target2, rep2)

# 2. In updateSettingsModalDisplay, guard updateDriveSyncStatusDisplay() and define it
target3 = "updateDriveSyncStatusDisplay();\n    }"
rep3 = """if (typeof updateDriveSyncStatusDisplay === 'function') updateDriveSyncStatusDisplay();
    }

    function updateDriveSyncStatusDisplay() {
      const badge = document.getElementById('topDriveSyncStatusText');
      if (badge) {
        badge.textContent = 'متزامن ✓';
        badge.style.color = '#34d399';
      }
      const spin = document.getElementById('headerMasterSyncSpinIcon');
      if (spin) spin.classList.remove('fa-spin');
    }"""
text = text.replace(target3, rep3)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed updateDriveSyncStatusDisplay and guarded auditAndRecomputeAllWalletBalances!")

function saveTx() {
      if (typeof triggerDriveAutoSync === "function") triggerDriveAutoSync();

      try {
        localStorage.setItem('family_monefy_v2_tx', JSON.stringify(state.transactions));
      } catch(e) {
        console.warn('LocalStorage limit exceeded, data retained in active memory state:', e);
      }
      try {
        syncChannel.postMessage({
          type: 'SYNC_TRANSACTIONS',
          transactions: state.transactions.slice(0, 500),
          sender: state.currentUser
        });
      } catch(e) {}
    }

    // =========================================================================
    // إدارة رفع وتصوير الفواتير (Receipt Camera / Upload)
    // =========================================================================
    function handleReceiptUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const maxDim = 600;
          let w = img.width;
          let h = img.height;
          if (w > h && w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext
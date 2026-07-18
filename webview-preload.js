const { ipcRenderer } = require('electron');

// Preload script running inside <webview> guest pages.
// Listens for messages from the embedder and performs DOM operations
// (auto-fill, attach submit listeners, find element at point) and sends
// results back to the embedder via ipcRenderer.sendToHost.

// Auto-fill stored passwords into the first password field of the page.
ipcRenderer.on('kaif-auto-fill', (event, passwords) => {
  try {
    if (window.__kaif_autoFillDone) return;
    window.__kaif_autoFillDone = true;
    const p = passwords || {};
    const inputs = document.querySelectorAll('input[type="password"]');
    if (inputs.length === 0) return;
    const pass = inputs[0];
    const form = pass.form || pass.closest('form');
    if (!form) return;
    const uname = form.querySelector('input[type="text"],input[type="email"],input[name]');
    if (uname) {
      const firstUser = Object.keys(p)[0];
      if (firstUser) uname.value = firstUser;
    }
    const firstPassVal = Object.values(p)[0];
    if (firstPassVal) pass.value = firstPassVal;
  } catch (e) {
    // ignore
  }
});

// Attach submit listeners to forms and send credentials to host when submitted.
ipcRenderer.on('kaif-inject-capture', () => {
  try {
    if (window.__kaif_inject_done) return;
    window.__kaif_inject_done = true;
    document.querySelectorAll('form').forEach(function(f){
      if (f.dataset && f.dataset.kaifBound) return;
      f.dataset.kaifBound = '1';
      f.addEventListener('submit', function(){
        try {
          const u = this.querySelector('input[type="text"],input[type="email"],input[name]');
          const p = this.querySelector('input[type="password"]');
          const username = (u && u.value) || '';
          const password = (p && p.value) || '';
          const domain = location.hostname;
          ipcRenderer.sendToHost('save-password', { domain, username, password });
        } catch (e) { }
      });
    });
  } catch (e) { }
});

// Find link at coordinates and send it back to embedder.
ipcRenderer.on('kaif-get-link-at', (event, { x, y }) => {
  try {
    const el = document.elementFromPoint(x, y);
    let link = '';
    if (el) {
      link = el.href || el.getAttribute('href') || '';
      if (!link && el.closest) {
        const p = el.closest('a');
        if (p) link = p.href || '';
      }
    }
    ipcRenderer.sendToHost('context-link', link || '');
  } catch (e) {
    ipcRenderer.sendToHost('context-link', '');
  }
});

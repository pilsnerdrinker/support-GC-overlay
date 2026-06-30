const { contextBridge, ipcRenderer } = require('electron');

function clickSelector(selector) {
  const el = document.querySelector(selector);
  if (el instanceof HTMLElement) el.click();
}

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('overlay-shortcut', (_event, action) => {
    if (!action || typeof action !== 'object') return;

    if (action.type === 'tab' && ['gc1', 'gc2', 'result'].includes(action.tab)) {
      clickSelector(`[data-act="setTab"][data-tab="${action.tab}"]`);
      return;
    }

    if (action.type === 'reset') {
      clickSelector('#resetBtn');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') ipcRenderer.send('overlay-close');
  });
});

contextBridge.exposeInMainWorld('grandcrossOverlay', {
  close: () => ipcRenderer.send('overlay-close')
});

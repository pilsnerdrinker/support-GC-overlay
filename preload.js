const { contextBridge, ipcRenderer } = require('electron');

function clickSelector(selector) {
  const el = document.querySelector(selector);
  if (el instanceof HTMLElement) el.click();
}

function addOverlayControls() {
  const headActions = document.querySelector('.head-actions');
  if (!headActions || document.querySelector('.overlay-controls')) return;

  const controls = document.createElement('div');
  controls.className = 'overlay-controls';
  controls.innerHTML = `
    <button class="overlay-control-btn" type="button" data-overlay-action="shrink" title="小さくする">-</button>
    <button class="overlay-control-btn" type="button" data-overlay-action="grow" title="大きくする">+</button>
    <span class="overlay-opacity-label">濃淡</span>
    <input class="overlay-opacity-slider" type="range" min="35" max="100" value="90" step="1" title="透明度">
    <button class="overlay-control-btn overlay-close-btn" type="button" data-overlay-action="close" title="終了">×</button>
  `;

  headActions.prepend(controls);

  controls.addEventListener('click', (event) => {
    const button = event.target.closest('[data-overlay-action]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();

    const action = button.dataset.overlayAction;
    if (action === 'shrink') ipcRenderer.send('overlay-resize', -1);
    if (action === 'grow') ipcRenderer.send('overlay-resize', 1);
    if (action === 'close') ipcRenderer.send('overlay-close');
  });

  const slider = controls.querySelector('.overlay-opacity-slider');
  slider.addEventListener('input', () => {
    ipcRenderer.send('overlay-opacity', Number(slider.value) / 100);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  addOverlayControls();

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
  close: () => ipcRenderer.send('overlay-close'),
  resize: (direction) => ipcRenderer.send('overlay-resize', direction),
  setOpacity: (value) => ipcRenderer.send('overlay-opacity', value)
});

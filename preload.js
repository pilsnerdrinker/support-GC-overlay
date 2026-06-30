const { contextBridge, ipcRenderer } = require('electron');

function clickSelector(selector) {
  const el = document.querySelector(selector);
  if (el instanceof HTMLElement) el.click();
}

function addOverlayControls() {
  const headActions = document.querySelector('.head-actions');
  if (!headActions || document.querySelector('.overlay-controls')) return;

  const title = document.querySelector('header h1');
  if (title && !document.querySelector('.overlay-title-close-btn')) {
    const closeButton = document.createElement('button');
    closeButton.className = 'overlay-title-close-btn';
    closeButton.type = 'button';
    closeButton.title = '終了';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      ipcRenderer.send('overlay-close');
    });
    title.before(closeButton);
  }

  const controls = document.createElement('div');
  controls.className = 'overlay-controls';
  controls.innerHTML = `
    <button class="overlay-control-btn" type="button" data-overlay-action="shrink" title="小さくする">-</button>
    <button class="overlay-control-btn" type="button" data-overlay-action="grow" title="大きくする">+</button>
    <input class="overlay-opacity-slider" type="range" min="35" max="100" value="90" step="1" title="透明度">
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
  });

  const slider = controls.querySelector('.overlay-opacity-slider');
  slider.addEventListener('input', () => {
    ipcRenderer.send('overlay-opacity', Number(slider.value) / 100);
  });
}

function addResizeGrip() {
  if (document.querySelector('.overlay-resize-grip')) return;

  const grip = document.createElement('div');
  grip.className = 'overlay-resize-grip';
  grip.title = 'ドラッグでサイズ変更';
  grip.textContent = '↘';
  document.body.appendChild(grip);

  const stopDrag = () => ipcRenderer.send('overlay-resize-drag-stop');

  grip.addEventListener('mousedown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    ipcRenderer.send('overlay-resize-drag-start');
  });

  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('blur', stopDrag);
}

window.addEventListener('DOMContentLoaded', () => {
  addOverlayControls();
  addResizeGrip();

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
  startResizeDrag: () => ipcRenderer.send('overlay-resize-drag-start'),
  stopResizeDrag: () => ipcRenderer.send('overlay-resize-drag-stop'),
  setOpacity: (value) => ipcRenderer.send('overlay-opacity', value)
});

const { contextBridge, ipcRenderer } = require('electron');

function clickSelector(selector) {
  const el = document.querySelector(selector);
  if (el instanceof HTMLElement) el.click();
}

let padSelected = null;
let previousInputTab = 'gc1';
const PAD_KEY_FIELDS = ['act', 'gc', 'field', 'truth', 'kind', 'timing', 'element', 'memo'];

function getActiveTab() {
  const active = document.querySelector('.tabbar .gc-tab.active');
  return active?.dataset?.tab || 'gc1';
}

function clickTab(tab) {
  if (['gc1', 'gc2'].includes(getActiveTab())) previousInputTab = getActiveTab();
  clickSelector(`[data-act="setTab"][data-tab="${tab}"]`);
  window.setTimeout(() => {
    clearPadSelection();
    ensurePadSelection();
    reportContentSize();
  }, 0);
}

function switchTab(delta) {
  const tabs = ['gc1', 'gc2', 'result'];
  const active = getActiveTab();
  const index = Math.max(0, tabs.indexOf(active));
  const next = tabs[(index + delta + tabs.length) % tabs.length];
  clickTab(next);
}

function toggleResultTab() {
  const active = getActiveTab();
  if (active === 'result') {
    clickTab(previousInputTab || 'gc1');
    return;
  }
  if (['gc1', 'gc2'].includes(active)) previousInputTab = active;
  clickTab('result');
}

function getPadButtons() {
  const panel = document.querySelector('#sheet > .input-panel, #sheet > .result-panel');
  if (!panel) return [];
  return [...panel.querySelectorAll('button')]
    .filter(button => !button.disabled && button.offsetParent !== null);
}

function clearPadSelection() {
  if (padSelected) padSelected.classList.remove('pad-selected');
  padSelected = null;
}

function setPadSelection(button) {
  if (!button) return;
  clearPadSelection();
  padSelected = button;
  padSelected.classList.add('pad-selected');
}

function padButtonKey(button) {
  if (!button) return '';
  return PAD_KEY_FIELDS
    .map(field => `${field}:${button.dataset?.[field] || ''}`)
    .join('|');
}

function restorePadSelection(key) {
  if (!key) {
    ensurePadSelection();
    return;
  }
  const match = getPadButtons().find(button => padButtonKey(button) === key);
  if (match) {
    setPadSelection(match);
    return;
  }
  ensurePadSelection();
}

function ensurePadSelection() {
  const buttons = getPadButtons();
  if (!buttons.length) {
    clearPadSelection();
    return null;
  }
  if (!padSelected || !buttons.includes(padSelected)) {
    setPadSelection(buttons[0]);
  }
  return padSelected;
}

function centerOf(button) {
  const rect = button.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    rect
  };
}

function movePadSelection(direction) {
  const current = ensurePadSelection();
  if (!current) return;

  const buttons = getPadButtons();
  const origin = centerOf(current);
  const candidates = buttons
    .filter(button => button !== current)
    .map(button => ({ button, center: centerOf(button) }))
    .filter(({ center }) => {
      if (direction === 'up') return center.y < origin.y - 4;
      if (direction === 'down') return center.y > origin.y + 4;
      if (direction === 'left') return center.x < origin.x - 4;
      if (direction === 'right') return center.x > origin.x + 4;
      return false;
    })
    .sort((a, b) => {
      const ax = Math.abs(a.center.x - origin.x);
      const ay = Math.abs(a.center.y - origin.y);
      const bx = Math.abs(b.center.x - origin.x);
      const by = Math.abs(b.center.y - origin.y);
      if (direction === 'up' || direction === 'down') return ay * 1000 + ax - (by * 1000 + bx);
      return ax * 1000 + ay - (bx * 1000 + by);
    });

  if (candidates[0]) setPadSelection(candidates[0].button);
}

function activatePadSelection() {
  const current = ensurePadSelection();
  if (!current) return;
  const key = padButtonKey(current);
  current.click();
  window.setTimeout(() => {
    restorePadSelection(key);
    reportContentSize();
  }, 0);
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

function reportContentSize() {
  const app = document.querySelector('.app');
  if (!app) return;

  const bodyStyle = window.getComputedStyle(document.body);
  const paddingX = parseFloat(bodyStyle.paddingLeft) + parseFloat(bodyStyle.paddingRight);
  const paddingY = parseFloat(bodyStyle.paddingTop) + parseFloat(bodyStyle.paddingBottom);

  ipcRenderer.send('overlay-content-size', {
    width: app.scrollWidth + paddingX,
    height: app.scrollHeight + paddingY
  });
}

function observeContentSize() {
  const app = document.querySelector('.app');
  if (!app) return;

  const scheduleReport = () => {
    window.requestAnimationFrame(reportContentSize);
  };

  scheduleReport();

  const observer = new ResizeObserver(scheduleReport);
  observer.observe(app);
  observer.observe(document.body);

  const sheet = document.getElementById('sheet');
  if (sheet) observer.observe(sheet);

  document.addEventListener('click', () => {
    window.setTimeout(reportContentSize, 0);
  }, true);
}

window.addEventListener('DOMContentLoaded', () => {
  addOverlayControls();
  observeContentSize();

  ipcRenderer.on('overlay-shortcut', (_event, action) => {
    if (!action || typeof action !== 'object') return;

    if (action.type === 'tab' && ['gc1', 'gc2', 'result'].includes(action.tab)) {
      clickTab(action.tab);
      return;
    }

    if (action.type === 'tabDelta') {
      switchTab(Number(action.delta) < 0 ? -1 : 1);
      return;
    }

    if (action.type === 'toggleResult') {
      toggleResultTab();
      return;
    }

    if (action.type === 'move' && ['up', 'down', 'left', 'right'].includes(action.direction)) {
      movePadSelection(action.direction);
      return;
    }

    if (action.type === 'activate') {
      activatePadSelection();
      return;
    }

    if (action.type === 'reset') {
      clickSelector('#resetBtn');
      window.setTimeout(() => {
        clearPadSelection();
        ensurePadSelection();
        reportContentSize();
      }, 0);
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

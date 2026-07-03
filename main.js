const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');

const helperPath = path.join(__dirname, 'p4_grandcross_helper_v42_tabs.html');

let win;
let opacity = 0.9;
const MIN_OPACITY = 0.35;
const MAX_OPACITY = 1;
const RESIZE_STEP = 40;
const MIN_ZOOM = 0.45;
const MAX_ZOOM = 1.25;
let contentSize = { width: 410, height: 740 };

function createWindow() {
  win = new BrowserWindow({
    width: 380,
    height: 700,
    minWidth: 260,
    minHeight: 360,
    x: 40,
    y: 60,
    frame: false,
    transparent: true,
    resizable: true,
    movable: true,
    alwaysOnTop: true,
    focusable: false,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.setMenuBarVisibility(false);
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setOpacity(opacity);
  win.loadFile(helperPath);
  win.on('resize', updateZoomForBounds);

  win.webContents.once('did-finish-load', () => {
    win.webContents.insertCSS(`
      html, body {
        background: transparent !important;
        overflow: hidden !important;
        width: 100% !important;
        height: 100% !important;
      }

      body {
        padding: 6px !important;
      }

      .app {
        width: 390px !important;
        margin: 0 !important;
      }

      header {
        -webkit-app-region: drag;
        display: grid !important;
        grid-template-columns: 24px minmax(58px, auto) 1fr !important;
        align-items: center !important;
        background: rgba(255,255,255,.72);
        border: 1px solid rgba(17,17,17,.55);
        padding: 3px 4px !important;
        margin-bottom: 4px !important;
        gap: 4px !important;
        min-height: 31px !important;
        overflow: hidden !important;
      }

      header h1 {
        min-width: 0 !important;
        max-width: 78px !important;
        font-size: 13px !important;
        line-height: 1 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: clip !important;
      }

      header button,
      header input,
      .links a,
      button {
        -webkit-app-region: no-drag;
      }

      .overlay-title-close-btn {
        -webkit-app-region: no-drag;
        width: 22px;
        height: 22px;
        border: 1.5px solid #111;
        border-radius: 7px;
        background: #ffd8d8;
        color: #000;
        font-size: 13px;
        line-height: 1;
        font-weight: 1000;
        cursor: pointer;
        padding: 0;
      }

      .overlay-title-close-btn:active {
        filter: brightness(.92);
      }

      #vibrateBtn,
      #wakeBtn {
        display: none !important;
      }

      #resetBtn {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 47px !important;
        min-height: 22px !important;
        padding: 0 5px !important;
        border-width: 1.5px !important;
        border-radius: 7px !important;
        font-size: 11px !important;
        line-height: 1 !important;
        background: rgba(255,255,255,.86) !important;
      }

      .head-actions {
        min-width: 0 !important;
        gap: 0 !important;
        justify-content: end !important;
        overflow: hidden !important;
      }

      .overlay-controls {
        -webkit-app-region: no-drag;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
        min-width: 0;
      }

      .overlay-control-btn {
        min-width: 24px;
        min-height: 22px;
        border: 1.5px solid #111;
        border-radius: 7px;
        background: rgba(255,255,255,.92);
        color: #000;
        font-size: 13px;
        line-height: 1;
        font-weight: 1000;
        cursor: pointer;
        padding: 0 5px;
      }

      .overlay-control-btn:active {
        filter: brightness(.92);
      }

      .overlay-reset-btn {
        min-width: 48px;
        font-size: 11px;
      }

      .overlay-opacity-slider {
        width: 64px;
        accent-color: #5f8fe4;
        cursor: pointer;
      }

      .links,
      details {
        display: none !important;
      }

      .block,
      .input-block,
      .result-card,
      .summary {
        box-shadow: 0 4px 12px rgba(0,0,0,.18) !important;
      }

      .block,
      .input-block,
      .result-card,
      .summary,
      details {
        background: rgba(255,255,255,.06) !important;
      }

      .input-block,
      .result-card {
        padding: 7px !important;
      }

      .sheet,
      .input-panel,
      .result-panel {
        gap: 7px !important;
      }

      .bottom-tabbar {
        margin-top: 4px !important;
      }

      .input-block h2,
      .result-card h2,
      .field-title,
      .gc-tab,
      .choice-btn,
      .memo-choice,
      .memo-label,
      .result-label,
      .result-action,
      .result-round h3,
      .magic-memo h3,
      .memo-truth-box {
        text-shadow:
          -1px -1px 0 rgba(255,255,255,.92),
           1px -1px 0 rgba(255,255,255,.92),
          -1px  1px 0 rgba(255,255,255,.92),
           1px  1px 0 rgba(255,255,255,.92),
           0 1px 2px rgba(255,255,255,.95) !important;
      }

      .input-block h2 {
        font-size: 19px !important;
        margin-bottom: 6px !important;
      }

      .h2-note {
        font-size: 13px !important;
      }

      .field-title {
        font-size: 13px !important;
        margin: 6px 0 3px !important;
      }

      .choice-btn {
        min-height: 39px !important;
        font-size: 20px !important;
        padding: 1px 3px !important;
        line-height: 1 !important;
      }

      .gc-tab {
        min-height: 31px !important;
        font-size: 20px !important;
        line-height: 1 !important;
        padding: 1px 3px !important;
        background: rgba(255,255,255,.16) !important;
      }

      .gc-tab.active {
        background: rgba(191,239,255,.82) !important;
      }

      .pad-selected {
        outline: 4px solid #ffe100 !important;
        outline-offset: -5px !important;
        box-shadow:
          0 0 0 2px rgba(0,0,0,.95),
          0 0 12px 4px rgba(255,225,0,.75),
          inset 0 0 0 3px rgba(255,225,0,.4) !important;
        position: relative !important;
        z-index: 2 !important;
      }

      .choice-btn,
      .memo-choice,
      .memo-label,
      .memo-truth-box,
      .result-label,
      .result-action {
        background: rgba(255,255,255,.13) !important;
      }

      .choice-btn.active,
      .choice-btn.true.active,
      .truth.true.selected,
      .memo-choice.active.true {
        background: rgba(191,239,255,.82) !important;
      }

      .choice-btn.false.active,
      .truth.false.selected {
        background: rgba(255,216,216,.82) !important;
      }

      .memo-choice.active.false,
      .action.charge-step {
        background: rgba(255,227,181,.82) !important;
      }

      .icon-choice .icon,
      .icon-choice .icon img {
        width: 37px !important;
        height: 37px !important;
      }

      .icon-choice .icon {
        flex-basis: 37px !important;
      }

      .result-label {
        font-size: 18px !important;
        line-height: 1 !important;
      }

      .result-action {
        font-size: 20px !important;
        line-height: 1 !important;
      }

      .result-label .icon,
      .result-label .icon img {
        width: 35px !important;
        height: 35px !important;
      }

      .result-label .icon {
        flex-basis: 35px !important;
      }

      .memo-label {
        font-size: 15px !important;
        line-height: 1 !important;
      }

      .memo-label .icon,
      .memo-label .icon img {
        width: 32px !important;
        height: 32px !important;
      }

      .memo-label .icon {
        flex-basis: 32px !important;
      }

      .memo-choice,
      .memo-truth-box {
        font-size: 19px !important;
        line-height: 1 !important;
        padding: 1px 3px !important;
      }

      .result-round h3,
      .magic-memo h3 {
        background: rgba(0,0,0,.78) !important;
        color: #fff !important;
        text-shadow: 0 1px 2px rgba(0,0,0,.8) !important;
      }

      .action.stack,
      .action.spread {
        background: rgba(247,224,187,.82) !important;
      }

      .action.leave,
      .action.accel-stop {
        background: rgba(255,209,209,.82) !important;
      }

      .action.stay,
      .action.accel-move,
      .action.charge-safe {
        background: rgba(191,239,255,.82) !important;
      }

      .action.gaze {
        background: rgba(247,183,199,.82) !important;
      }

      .result-action.truth-true {
        background: rgba(191,239,255,.86) !important;
      }

      .result-action.truth-false {
        background: rgba(255,88,88,.86) !important;
      }

      .action.missing {
        background: rgba(221,221,221,.7) !important;
      }

      .toast {
        bottom: 8px !important;
      }
    `);
    updateZoomForBounds();
  });
}

function updateZoomForBounds() {
  if (!win || win.isDestroyed()) return;
  const bounds = win.getBounds();
  const widthZoom = bounds.width / contentSize.width;
  const heightZoom = bounds.height / contentSize.height;
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(widthZoom, heightZoom)));
  win.webContents.setZoomFactor(Number(zoom.toFixed(3)));
}

function sendShortcut(action) {
  if (!win || win.isDestroyed()) return;
  win.webContents.send('overlay-shortcut', action);
}

function setOverlayOpacity(nextOpacity) {
  opacity = Math.min(MAX_OPACITY, Math.max(MIN_OPACITY, Number(nextOpacity.toFixed(2))));
  if (win && !win.isDestroyed()) win.setOpacity(opacity);
}

function resizeOverlay(direction) {
  if (!win || win.isDestroyed()) return;
  const bounds = win.getBounds();
  const displayBounds = screen.getDisplayMatching(bounds).workArea;
  const nextWidth = Math.min(displayBounds.width, Math.max(260, bounds.width + RESIZE_STEP * direction));
  const nextHeight = Math.min(displayBounds.height, Math.max(360, bounds.height + RESIZE_STEP * direction));
  win.setBounds({ width: nextWidth, height: nextHeight });
  updateZoomForBounds();
}

function registerShortcuts() {
  globalShortcut.register('CommandOrControl+Alt+1', () => sendShortcut({ type: 'tab', tab: 'gc1' }));
  globalShortcut.register('CommandOrControl+Alt+2', () => sendShortcut({ type: 'tab', tab: 'gc2' }));
  globalShortcut.register('CommandOrControl+Alt+3', () => sendShortcut({ type: 'tab', tab: 'result' }));
  globalShortcut.register('CommandOrControl+Alt+R', () => sendShortcut({ type: 'reset' }));
  globalShortcut.register('CommandOrControl+Alt+Up', () => setOverlayOpacity(opacity + 0.08));
  globalShortcut.register('CommandOrControl+Alt+Down', () => setOverlayOpacity(opacity - 0.08));
  globalShortcut.register('CommandOrControl+Alt+Q', () => app.quit());

  globalShortcut.register('CommandOrControl+Alt+Shift+1', () => sendShortcut({ type: 'tabDelta', delta: 1 }));
  globalShortcut.register('CommandOrControl+Alt+Shift+2', () => sendShortcut({ type: 'tabDelta', delta: -1 }));
  globalShortcut.register('CommandOrControl+Alt+Shift+3', () => sendShortcut({ type: 'move', direction: 'up' }));
  globalShortcut.register('CommandOrControl+Alt+Shift+4', () => sendShortcut({ type: 'move', direction: 'down' }));
  globalShortcut.register('CommandOrControl+Alt+Shift+5', () => sendShortcut({ type: 'move', direction: 'left' }));
  globalShortcut.register('CommandOrControl+Alt+Shift+6', () => sendShortcut({ type: 'move', direction: 'right' }));
  globalShortcut.register('CommandOrControl+Alt+Shift+7', () => sendShortcut({ type: 'activate' }));
  globalShortcut.register('CommandOrControl+Alt+Shift+8', () => sendShortcut({ type: 'toggleResult' }));
  globalShortcut.register('CommandOrControl+Alt+Shift+9', () => sendShortcut({ type: 'reset' }));
}

app.whenReady().then(() => {
  createWindow();
  registerShortcuts();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.on('overlay-close', () => {
  app.quit();
});

ipcMain.on('overlay-opacity', (_event, nextOpacity) => {
  setOverlayOpacity(Number(nextOpacity));
});

ipcMain.on('overlay-resize', (_event, direction) => {
  resizeOverlay(Number(direction) < 0 ? -1 : 1);
});

ipcMain.on('overlay-content-size', (_event, size) => {
  if (!size || typeof size !== 'object') return;
  const width = Number(size.width);
  const height = Number(size.height);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return;
  contentSize = {
    width: Math.max(1, Math.ceil(width)),
    height: Math.max(1, Math.ceil(height))
  };
  updateZoomForBounds();
});

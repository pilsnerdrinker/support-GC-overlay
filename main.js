const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');

const helperPath = path.join(__dirname, 'p4_grandcross_helper_v42_tabs.html');

let win;
let opacity = 0.9;
const MIN_OPACITY = 0.35;
const MAX_OPACITY = 1;
const RESIZE_STEP = 40;
const BASE_WIDTH = 380;
const BASE_HEIGHT = 700;
const MIN_ZOOM = 0.45;
const MAX_ZOOM = 1.25;
let resizeDrag = null;

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

      #resetBtn,
      #vibrateBtn,
      #wakeBtn {
        display: none !important;
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

      .overlay-resize-grip {
        -webkit-app-region: no-drag;
        position: fixed;
        right: 5px;
        bottom: 5px;
        width: 26px;
        height: 26px;
        border: 1.5px solid rgba(17,17,17,.85);
        border-radius: 7px;
        background: rgba(255,255,255,.78);
        color: #111;
        display: grid;
        place-items: center;
        font-size: 16px;
        font-weight: 1000;
        line-height: 1;
        cursor: nwse-resize;
        z-index: 1000;
        user-select: none;
      }

      .overlay-resize-grip:active {
        filter: brightness(.92);
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
  const widthZoom = bounds.width / BASE_WIDTH;
  const heightZoom = bounds.height / BASE_HEIGHT;
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

function startResizeDrag() {
  if (!win || win.isDestroyed()) return;
  const startPoint = screen.getCursorScreenPoint();
  const startBounds = win.getBounds();
  const displayBounds = screen.getDisplayMatching(startBounds).workArea;

  stopResizeDrag();
  resizeDrag = setInterval(() => {
    if (!win || win.isDestroyed()) {
      stopResizeDrag();
      return;
    }
    const point = screen.getCursorScreenPoint();
    const nextWidth = Math.min(displayBounds.width, Math.max(260, startBounds.width + point.x - startPoint.x));
    const nextHeight = Math.min(displayBounds.height, Math.max(360, startBounds.height + point.y - startPoint.y));
    win.setBounds({ width: nextWidth, height: nextHeight });
    updateZoomForBounds();
  }, 16);
}

function stopResizeDrag() {
  if (!resizeDrag) return;
  clearInterval(resizeDrag);
  resizeDrag = null;
}

function registerShortcuts() {
  globalShortcut.register('CommandOrControl+Alt+1', () => sendShortcut({ type: 'tab', tab: 'gc1' }));
  globalShortcut.register('CommandOrControl+Alt+2', () => sendShortcut({ type: 'tab', tab: 'gc2' }));
  globalShortcut.register('CommandOrControl+Alt+3', () => sendShortcut({ type: 'tab', tab: 'result' }));
  globalShortcut.register('CommandOrControl+Alt+R', () => sendShortcut({ type: 'reset' }));
  globalShortcut.register('CommandOrControl+Alt+Up', () => setOverlayOpacity(opacity + 0.08));
  globalShortcut.register('CommandOrControl+Alt+Down', () => setOverlayOpacity(opacity - 0.08));
  globalShortcut.register('CommandOrControl+Alt+Q', () => app.quit());
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

ipcMain.on('overlay-resize-drag-start', () => {
  startResizeDrag();
});

ipcMain.on('overlay-resize-drag-stop', () => {
  stopResizeDrag();
});

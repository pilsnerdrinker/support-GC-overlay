const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');

const helperPath = path.join(__dirname, 'p4_grandcross_helper_v42_tabs.html');

let win;
let opacity = 0.9;
const MIN_OPACITY = 0.35;
const MAX_OPACITY = 1;
const RESIZE_STEP = 40;

function createWindow() {
  win = new BrowserWindow({
    width: 380,
    height: 700,
    minWidth: 300,
    minHeight: 420,
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

  win.webContents.once('did-finish-load', () => {
    win.webContents.insertCSS(`
      html, body {
        background: transparent !important;
        overflow: auto !important;
      }

      body {
        padding: 6px !important;
      }

      .app {
        width: min(390px, 100%) !important;
        margin: 0 !important;
      }

      header {
        -webkit-app-region: drag;
        background: rgba(255,255,255,.72);
        border: 1px solid rgba(17,17,17,.55);
        padding: 4px 6px;
        margin-bottom: 4px !important;
      }

      header button,
      header input,
      .links a,
      button {
        -webkit-app-region: no-drag;
      }

      #vibrateBtn,
      #wakeBtn {
        display: none !important;
      }

      .head-actions {
        gap: 5px !important;
      }

      .overlay-controls {
        -webkit-app-region: no-drag;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .overlay-control-btn {
        min-width: 26px;
        min-height: 24px;
        border: 1.5px solid #111;
        border-radius: 7px;
        background: rgba(255,255,255,.92);
        color: #000;
        font-size: 14px;
        line-height: 1;
        font-weight: 1000;
        cursor: pointer;
      }

      .overlay-control-btn:active {
        filter: brightness(.92);
      }

      .overlay-close-btn {
        background: #ffd8d8;
      }

      .overlay-opacity-label {
        font-size: 11px;
        font-weight: 1000;
        color: #111;
        white-space: nowrap;
      }

      .overlay-opacity-slider {
        width: 70px;
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

      .toast {
        bottom: 8px !important;
      }
    `);
  });
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
  const nextWidth = Math.min(displayBounds.width, Math.max(300, bounds.width + RESIZE_STEP * direction));
  const nextHeight = Math.min(displayBounds.height, Math.max(420, bounds.height + RESIZE_STEP * direction));
  win.setBounds({ width: nextWidth, height: nextHeight });
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

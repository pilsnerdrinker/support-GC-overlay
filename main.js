const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

const helperPath = path.join(__dirname, 'p4_grandcross_helper_v42_tabs.html');

let win;
let opacity = 0.9;

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
      .links a,
      button {
        -webkit-app-region: no-drag;
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
  opacity = Math.min(1, Math.max(0.35, Number(nextOpacity.toFixed(2))));
  if (win && !win.isDestroyed()) win.setOpacity(opacity);
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

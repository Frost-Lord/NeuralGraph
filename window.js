const { app, BrowserWindow, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
const ejs = require('ejs');
let mainWindow;

function createWindow() {
  const logoPath = path.join(__dirname, 'logo.png');
  const logoImage = nativeImage.createFromPath(logoPath);

  mainWindow = new BrowserWindow({
    width: 950,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: logoImage,
  });

  mainWindow.loadFile(path.join(__dirname, 'views', 'loading.html'));

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('will-attach-webview', (event, webPreferences, params) => {
    webPreferences.webSecurity = false;
    delete webPreferences.preload;
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
  });

  mainWindow.once('ready-to-show', async () => {
    mainWindow.show();
    const data = {};
    setTimeout(() => {
      ejs.renderFile(path.join(__dirname, 'views', 'index.ejs'), data, (err, html) => {
        if (err) {
          console.error(err);
          return;
        }

        mainWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);
      });
    }, 5000);
  });

  Menu.setApplicationMenu(null);
}

app.whenReady().then(() => {
  createWindow();
});

ipcMain.on('navigate-to-3dmodel', () => {
  ejs.renderFile(path.join(__dirname, 'views', '3dmodel.ejs'), {}, (err, html) => {
    if (err) {
      console.error(err);
      return;
    }

    mainWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);
  });
});

ipcMain.on('navigate-to-home', () => {
  ejs.renderFile(path.join(__dirname, 'views', 'index.ejs'), {}, (err, html) => {
    if (err) {
      console.error(err);
      return;
    }

    mainWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);
  });
});
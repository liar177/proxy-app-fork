const { app, BrowserWindow } = require('electron');
const { fork } = require('child_process');
const path = require('path');
const http = require('http');

let serverProcess = null;
let mainWindow = null;
const PORT = parseInt(process.env.PROXY_APP_PORT, 10) || 3000;

function startServer() {
  return new Promise((resolve, reject) => {
    const serverPath = path.join(__dirname, '..', 'dist', 'main.js');
    const dataDir = path.join(app.getPath('userData'), 'data');

    serverProcess = fork(serverPath, [], {
      env: {
        ...process.env,
        PROXY_APP_PORT: String(PORT),
        DATA_DIR: dataDir,
        NODE_ENV: 'production',
      },
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });

    serverProcess.stdout.on('data', (d) => console.log(`[NestJS] ${d.toString().trim()}`));
    serverProcess.stderr.on('data', (d) => console.error(`[NestJS] ${d.toString().trim()}`));

    serverProcess.on('error', (err) => {
      console.error('Failed to start NestJS:', err);
      reject(err);
    });

    serverProcess.on('exit', (code) => {
      console.log(`NestJS process exited with code ${code}`);
      serverProcess = null;
    });

    // 轮询等待服务就绪
    let retries = 0;
    const check = () => {
      retries++;
      http.get(`http://127.0.0.1:${PORT}/api-proxy/project/list`, () => resolve())
        .on('error', () => {
          if (retries < 30) {
            setTimeout(check, 500);
          } else {
            reject(new Error(`NestJS server did not start on port ${PORT} within timeout`));
          }
        });
    };
    setTimeout(check, 1000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'Easy Proxy',
    autoHideMenuBar: true,
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    console.log('Starting NestJS server...');
    await startServer();
    console.log('NestJS server is ready.');
    createWindow();
  } catch (err) {
    console.error('Failed to start application:', err);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

import path from 'path';
import { app, BrowserWindow } from 'electron';
import http from 'http';
import next from 'next';

const dev = process.env.NODE_ENV === 'development';
const nextDir = path.join(__dirname, '..');
let server: http.Server | null = null;
let win: BrowserWindow;               // делаем переменную видимой ниже

async function createWindow() {
  // ────────── NEXT.JS DEV SERVER ──────────
  if (dev) {
    const nextApp = next({ dev, dir: nextDir });
    const handle  = nextApp.getRequestHandler();

    await nextApp.prepare();

    server = http.createServer((req, res) => handle(req, res));
    server.listen(3000, () =>
      console.log('Next.js dev server running on http://localhost:3000')
    );
  }

  // ────────── СОЗДАЁМ ОКНО ──────────
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // ----------  CSP ДЛЯ ВСЕХ РЕСУРСОВ ОКНА ----------
  win.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          // ⚠️ Одна строка — один элемент массива!
          'Content-Security-Policy': [
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: https:; " +
            "connect-src 'self' https://*.supabase.co https://*.supabase.com; " +
            "font-src 'self' https:; " +
            "frame-src https://*.supabase.co;"
          ],
        },
      });
    }
  );
  // -----------------------------------------------

  // Загружаем UI (dev → localhost, prod → файл build‑а)
  await win.loadURL(dev ? 'http://localhost:3000' : `file://${path.join(nextDir, 'out/index.html')}`);

  if (dev) win.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (server) server.close();
});

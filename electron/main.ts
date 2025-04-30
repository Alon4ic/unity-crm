import { app, BrowserWindow } from 'electron';
import path from 'path';
import http from 'http';
import next from 'next';
import prisma from './db'; // 👈 Оставляем подключение Prisma если оно нужно для других целей

const dev = process.env.NODE_ENV === 'development';
const nextDir = path.join(__dirname, '..');
let server: http.Server | null = null;

async function createWindow() {
    // УДАЛЕН БЛОК СОЗДАНИЯ ТЕСТОВОГО ТОВАРА

    // 👇 Поднимаем Next.js сервер только в dev
    if (dev) {
        const nextApp = next({ dev, dir: nextDir });
        const handle = nextApp.getRequestHandler();

        await nextApp.prepare();

        server = http.createServer((req, res) => {
            handle(req, res);
        });

        server.listen(3000, () => {
            console.log('Next.js dev server running on http://localhost:3000');
        });
    }

    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });

    // Загружаем UI
    await win.loadURL('http://localhost:3000');

    if (dev) {
        win.webContents.openDevTools();
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
    if (server) server.close();
});

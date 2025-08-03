"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
if (process.env.NODE_ENV === 'development') {
    require('electron-reload')(__dirname, {
        electron: path_1.default.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
        forceHardReset: true,
        hardResetMethod: 'exit',
    });
}
const electron_1 = require("electron");
const http_1 = __importDefault(require("http"));
const next_1 = __importDefault(require("next"));
const dev = process.env.NODE_ENV === 'development';
const nextDir = path_1.default.join(__dirname, '..');
let server = null;
async function createWindow() {
    // 👇 Поднимаем Next.js сервер только в dev
    if (dev) {
        const nextApp = (0, next_1.default)({ dev, dir: nextDir });
        const handle = nextApp.getRequestHandler();
        await nextApp.prepare();
        server = http_1.default.createServer((req, res) => {
            handle(req, res);
        });
        server.listen(3000, () => {
            console.log('Next.js dev server running on http://localhost:3000');
        });
    }
    const win = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });
    // Загружаем UI
    await win.loadURL('http://localhost:3000');
    if (dev) {
        win.webContents.openDevTools();
    }
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
electron_1.app.on('before-quit', () => {
    if (server)
        server.close();
});

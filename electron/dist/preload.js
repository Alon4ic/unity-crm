"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('api', {
    // Prisma / SQLite API
    getProducts: () => electron_1.ipcRenderer.invoke('get-products'),
    addProduct: (data) => electron_1.ipcRenderer.invoke('add-product', data),
    // electron-store API
    store: {
        get: (key) => electron_1.ipcRenderer.invoke('electron-store:get', key),
        set: (key, value) => electron_1.ipcRenderer.invoke('electron-store:set', key, value),
        delete: (key) => electron_1.ipcRenderer.invoke('electron-store:delete', key),
    },
});

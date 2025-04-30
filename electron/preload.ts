import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    // Prisma / SQLite API
    getProducts: () => ipcRenderer.invoke('get-products'),
    addProduct: (data: any) => ipcRenderer.invoke('add-product', data),

    // electron-store API
    store: {
        get: (key: string) => ipcRenderer.invoke('electron-store:get', key),
        set: (key: string, value: string) =>
            ipcRenderer.invoke('electron-store:set', key, value),
        delete: (key: string) =>
            ipcRenderer.invoke('electron-store:delete', key),
    },
});

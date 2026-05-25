// src/global.d.ts
interface Window {
    electron: {
      saveFile: (path: string, content: string) => Promise<void>;
    };
  }
  
// Chrome Storage API wrapper for vehicle data persistence

export interface ChromeStorageData {
  vehicles: any[];
  facebookGroups: any[];
  preferences: {
    autoPost: boolean;
    maxGroupsPerPost: number;
    postDelay: number;
  };
  scrapingHistory: any[];
}

export class ChromeStorage {
  // Check if Chrome storage is available
  static isAvailable(): boolean {
    return typeof (globalThis as any).chrome !== 'undefined' && 
           (globalThis as any).chrome.storage && 
           (globalThis as any).chrome.storage.sync;
  }

  // Get data from Chrome storage
  static async get<T>(key: keyof ChromeStorageData): Promise<T | null> {
    if (!this.isAvailable()) {
      throw new Error('Chrome storage not available');
    }

    return new Promise((resolve, reject) => {
      const chromeApi = (globalThis as any).chrome;
      chromeApi.storage.sync.get([key], (result: any) => {
        if (chromeApi.runtime.lastError) {
          reject(new Error(chromeApi.runtime.lastError.message));
        } else {
          resolve(result[key] || null);
        }
      });
    });
  }

  // Set data in Chrome storage
  static async set<T>(key: keyof ChromeStorageData, value: T): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Chrome storage not available');
    }

    return new Promise((resolve, reject) => {
      const chromeApi = (globalThis as any).chrome;
      chromeApi.storage.sync.set({ [key]: value }, () => {
        if (chromeApi.runtime.lastError) {
          reject(new Error(chromeApi.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  // Get all data from Chrome storage
  static async getAll(): Promise<Partial<ChromeStorageData>> {
    if (!this.isAvailable()) {
      throw new Error('Chrome storage not available');
    }

    return new Promise((resolve, reject) => {
      const chromeApi = (globalThis as any).chrome;
      chromeApi.storage.sync.get(null, (result: any) => {
        if (chromeApi.runtime.lastError) {
          reject(new Error(chromeApi.runtime.lastError.message));
        } else {
          resolve(result);
        }
      });
    });
  }

  // Clear all data from Chrome storage
  static async clear(): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Chrome storage not available');
    }

    return new Promise((resolve, reject) => {
      const chromeApi = (globalThis as any).chrome;
      chromeApi.storage.sync.clear(() => {
        if (chromeApi.runtime.lastError) {
          reject(new Error(chromeApi.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  // Listen for storage changes
  static addListener(callback: (changes: any, areaName: string) => void): void {
    if (!this.isAvailable()) {
      throw new Error('Chrome storage not available');
    }

    const chromeApi = (globalThis as any).chrome;
    chromeApi.storage.onChanged.addListener(callback);
  }

  // Remove storage change listener
  static removeListener(callback: (changes: any, areaName: string) => void): void {
    if (!this.isAvailable()) {
      throw new Error('Chrome storage not available');
    }

    const chromeApi = (globalThis as any).chrome;
    chromeApi.storage.onChanged.removeListener(callback);
  }
}
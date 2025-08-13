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
    return typeof chrome !== 'undefined' && 
           chrome.storage && 
           chrome.storage.sync;
  }

  // Get data from Chrome storage
  static async get<T>(key: keyof ChromeStorageData): Promise<T | null> {
    if (!this.isAvailable()) {
      throw new Error('Chrome storage not available');
    }

    return new Promise((resolve, reject) => {
      chrome.storage.sync.get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
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
      chrome.storage.sync.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
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
      chrome.storage.sync.get(null, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result as Partial<ChromeStorageData>);
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
      chrome.storage.sync.clear(() => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  // Listen for storage changes
  static addListener(callback: (changes: chrome.storage.StorageChange, areaName: string) => void): void {
    if (!this.isAvailable()) {
      throw new Error('Chrome storage not available');
    }

    chrome.storage.onChanged.addListener(callback);
  }

  // Remove storage change listener
  static removeListener(callback: (changes: chrome.storage.StorageChange, areaName: string) => void): void {
    if (!this.isAvailable()) {
      throw new Error('Chrome storage not available');
    }

    chrome.storage.onChanged.removeListener(callback);
  }

  // Sync data with web application
  static async syncWithServer(apiUrl: string): Promise<void> {
    try {
      const data = await this.getAll();
      
      // Upload vehicles to server
      if (data.vehicles && data.vehicles.length > 0) {
        for (const vehicle of data.vehicles) {
          try {
            await fetch(`${apiUrl}/api/vehicles`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(vehicle),
            });
          } catch (error) {
            console.error('Failed to sync vehicle:', error);
          }
        }
      }

      // Upload Facebook groups to server
      if (data.facebookGroups && data.facebookGroups.length > 0) {
        for (const group of data.facebookGroups) {
          try {
            await fetch(`${apiUrl}/api/facebook-groups`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(group),
            });
          } catch (error) {
            console.error('Failed to sync Facebook group:', error);
          }
        }
      }

    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }
}

// Vehicle storage utilities
export class VehicleStorage {
  static async saveVehicle(vehicle: any): Promise<void> {
    const vehicles = await ChromeStorage.get<any[]>('vehicles') || [];
    vehicles.push({ ...vehicle, id: Date.now().toString() });
    await ChromeStorage.set('vehicles', vehicles);
  }

  static async getVehicles(): Promise<any[]> {
    return await ChromeStorage.get<any[]>('vehicles') || [];
  }

  static async updateVehicle(id: string, updates: any): Promise<void> {
    const vehicles = await ChromeStorage.get<any[]>('vehicles') || [];
    const index = vehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      vehicles[index] = { ...vehicles[index], ...updates };
      await ChromeStorage.set('vehicles', vehicles);
    }
  }

  static async deleteVehicle(id: string): Promise<void> {
    const vehicles = await ChromeStorage.get<any[]>('vehicles') || [];
    const filtered = vehicles.filter(v => v.id !== id);
    await ChromeStorage.set('vehicles', filtered);
  }
}

// Facebook groups storage utilities
export class FacebookGroupStorage {
  static async saveGroup(group: any): Promise<void> {
    const groups = await ChromeStorage.get<any[]>('facebookGroups') || [];
    groups.push({ ...group, id: Date.now().toString() });
    await ChromeStorage.set('facebookGroups', groups);
  }

  static async getGroups(): Promise<any[]> {
    return await ChromeStorage.get<any[]>('facebookGroups') || [];
  }

  static async updateGroup(id: string, updates: any): Promise<void> {
    const groups = await ChromeStorage.get<any[]>('facebookGroups') || [];
    const index = groups.findIndex(g => g.id === id);
    if (index !== -1) {
      groups[index] = { ...groups[index], ...updates };
      await ChromeStorage.set('facebookGroups', groups);
    }
  }

  static async deleteGroup(id: string): Promise<void> {
    const groups = await ChromeStorage.get<any[]>('facebookGroups') || [];
    const filtered = groups.filter(g => g.id !== id);
    await ChromeStorage.set('facebookGroups', filtered);
  }
}

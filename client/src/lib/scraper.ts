// Car scraping functions
import { validateVin } from "./vin-validator";

interface ScrapedVehicle {
  vin: string;
  make: string;
  model: string;
  year: number;
  price: string;
  mileage: number;
  images?: string[];
  features?: string[];
  description?: string;
  sourceUrl: string;
  sourceSite: string;
}

export class CarScraper {
  static async isExtensionAvailable(): Promise<boolean> {
    const chromeApi = (globalThis as any).chrome;
    if (typeof chromeApi === 'undefined' || !chromeApi.runtime) {
      return false;
    }

    try {
      return new Promise((resolve) => {
        chromeApi.runtime.sendMessage(
          {
            action: 'ping'
          },
          (response: any) => {
            if (chromeApi.runtime.lastError) {
              resolve(false);
            } else {
              resolve(response?.success === true);
            }
          }
        );
      });
    } catch (error) {
      return false;
    }
  }

  static async startScraping(url: string): Promise<ScrapedVehicle[]> {
    const isAvailable = await this.isExtensionAvailable();
    if (!isAvailable) {
      throw new Error('Chrome extension not available');
    }

    return new Promise((resolve, reject) => {
      const chromeApi = (globalThis as any).chrome;
      chromeApi.runtime.sendMessage(
        {
          action: 'scrape',
          url: url
        },
        (response: any) => {
          if (chromeApi.runtime.lastError) {
            reject(new Error(chromeApi.runtime.lastError.message));
          } else if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.vehicles || []);
          }
        }
      );
    });
  }

  static async getSupportedSites(): Promise<string[]> {
    return [
      'autotrader.com',
      'cars.com', 
      'cargurus.com',
      'dealer.com',
      'carmax.com'
    ];
  }

  static async validateScrapedData(vehicles: ScrapedVehicle[]): Promise<ScrapedVehicle[]> {
    return vehicles.filter(vehicle => {
      // Validate VIN
      if (!vehicle.vin || !validateVin(vehicle.vin)) {
        console.warn(`Invalid VIN: ${vehicle.vin}`);
        return false;
      }

      // Validate required fields
      if (!vehicle.make || !vehicle.model || !vehicle.year || !vehicle.price) {
        console.warn(`Missing required fields for vehicle: ${vehicle.vin}`);
        return false;
      }

      // Validate year range (reasonable range)
      const currentYear = new Date().getFullYear();
      if (vehicle.year < 1980 || vehicle.year > currentYear + 1) {
        console.warn(`Invalid year: ${vehicle.year} for VIN: ${vehicle.vin}`);
        return false;
      }

      return true;
    });
  }

  static async getScrapingStatus(): Promise<{
    isRunning: boolean;
    progress?: number;
    currentSite?: string;
    vehiclesFound?: number;
  }> {
    const isAvailable = await this.isExtensionAvailable();
    if (!isAvailable) {
      return { isRunning: false };
    }

    return new Promise((resolve) => {
      const chromeApi = (globalThis as any).chrome;
      chromeApi.runtime.sendMessage(
        { action: 'getStatus' },
        (response: any) => {
          resolve(response || { isRunning: false });
        }
      );
    });
  }

  static async stopScraping(): Promise<void> {
    const isAvailable = await this.isExtensionAvailable();
    if (!isAvailable) {
      throw new Error('Chrome extension not available');
    }

    return new Promise((resolve, reject) => {
      const chromeApi = (globalThis as any).chrome;
      chromeApi.runtime.sendMessage(
        { action: 'stop' },
        (response: any) => {
          if (chromeApi.runtime.lastError) {
            reject(new Error(chromeApi.runtime.lastError.message));
          } else {
            resolve();
          }
        }
      );
    });
  }
}
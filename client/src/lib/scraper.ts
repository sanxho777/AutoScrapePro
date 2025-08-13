import { InsertVehicle } from "@shared/schema";
import { validateVin } from "./vin-validator";

export interface ScrapingResult {
  success: boolean;
  vehicles: InsertVehicle[];
  errors: string[];
}

export interface ScrapeOptions {
  url: string;
  sourceSite: string;
  maxVehicles?: number;
}

// This would interface with the Chrome extension
export class WebScraper {
  static async scrapeUrl(options: ScrapeOptions): Promise<ScrapingResult> {
    // In a real implementation, this would communicate with the Chrome extension
    // For now, we'll return a mock result
    console.log("Initiating scrape for:", options.url);
    
    // Check if Chrome extension is available
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      throw new Error("Chrome extension not available. Please install the VinScraper extension.");
    }

    try {
      // Send message to Chrome extension
      const response = await new Promise<any>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            action: "scrapeWebsite",
            data: options
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          }
        );
      });

      return response;
    } catch (error) {
      throw new Error(`Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static getSupportedSites(): string[] {
    return [
      "AutoTrader",
      "Cars.com",
      "CarGurus",
      "Dealer.com",
      "CarMax",
    ];
  }

  static isSupportedSite(url: string): boolean {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return (
        hostname.includes("autotrader") ||
        hostname.includes("cars.com") ||
        hostname.includes("cargurus") ||
        hostname.includes("dealer.com") ||
        hostname.includes("carmax")
      );
    } catch {
      return false;
    }
  }

  static detectSiteFromUrl(url: string): string {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      
      if (hostname.includes("autotrader")) return "AutoTrader";
      if (hostname.includes("cars.com")) return "Cars.com";
      if (hostname.includes("cargurus")) return "CarGurus";
      if (hostname.includes("dealer.com")) return "Dealer.com";
      if (hostname.includes("carmax")) return "CarMax";
      
      return "Unknown";
    } catch {
      return "Unknown";
    }
  }
}

// Vehicle data extraction patterns for different sites
export const scrapingPatterns = {
  autotrader: {
    vehicle: '[data-cmp="inventoryListing"]',
    price: '[data-cmp="price"]',
    title: '[data-cmp="vehicleTitle"]',
    mileage: '[data-cmp="mileage"]',
    vin: '[data-vin]',
    images: '[data-cmp="vehicleImage"] img',
  },
  cars: {
    vehicle: '.shop-srp-listings__listing-container',
    price: '.primary-price',
    title: '.listing-row__title',
    mileage: '.listing-row__mileage',
    vin: '[data-vin]',
    images: '.listing-row__image img',
  },
  cargurus: {
    vehicle: '[data-testid="listing-card"]',
    price: '[data-testid="price"]',
    title: '[data-testid="listing-title"]',
    mileage: '[data-testid="mileage"]',
    vin: '[data-vin]',
    images: '[data-testid="listing-image"] img',
  },
};

// Extract vehicle data from HTML
export function extractVehicleData(html: string, sourceSite: string, sourceUrl: string): InsertVehicle[] {
  // This would be implemented in the Chrome extension content script
  // For now, return empty array as this needs DOM access
  console.log("Extracting vehicle data from HTML for:", sourceSite);
  return [];
}

// Validate extracted vehicle data
export function validateVehicleData(vehicle: Partial<InsertVehicle>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!vehicle.vin || !validateVin(vehicle.vin)) {
    errors.push("Invalid or missing VIN");
  }

  if (!vehicle.make) {
    errors.push("Missing vehicle make");
  }

  if (!vehicle.model) {
    errors.push("Missing vehicle model");
  }

  if (!vehicle.year || vehicle.year < 1900 || vehicle.year > new Date().getFullYear() + 2) {
    errors.push("Invalid or missing vehicle year");
  }

  if (!vehicle.price || parseFloat(vehicle.price.toString()) <= 0) {
    errors.push("Invalid or missing price");
  }

  if (!vehicle.mileage || vehicle.mileage < 0) {
    errors.push("Invalid or missing mileage");
  }

  if (!vehicle.sourceUrl) {
    errors.push("Missing source URL");
  }

  if (!vehicle.sourceSite) {
    errors.push("Missing source site");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

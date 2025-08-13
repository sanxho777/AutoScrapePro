import { type Vehicle, type InsertVehicle, type FacebookGroup, type InsertFacebookGroup, type FacebookPost, type InsertFacebookPost, type ScrapingLog, type InsertScrapingLog } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Vehicles
  getVehicles(limit?: number, offset?: number): Promise<{ vehicles: Vehicle[], total: number }>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getVehicleByVin(vin: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;
  
  // Facebook Groups
  getFacebookGroups(): Promise<FacebookGroup[]>;
  getFacebookGroup(id: string): Promise<FacebookGroup | undefined>;
  createFacebookGroup(group: InsertFacebookGroup): Promise<FacebookGroup>;
  updateFacebookGroup(id: string, updates: Partial<FacebookGroup>): Promise<FacebookGroup | undefined>;
  deleteFacebookGroup(id: string): Promise<boolean>;
  
  // Facebook Posts
  getFacebookPosts(vehicleId?: string, groupId?: string): Promise<FacebookPost[]>;
  createFacebookPost(post: InsertFacebookPost): Promise<FacebookPost>;
  updateFacebookPost(id: string, updates: Partial<FacebookPost>): Promise<FacebookPost | undefined>;
  
  // Scraping Logs
  getScrapingLogs(limit?: number): Promise<ScrapingLog[]>;
  createScrapingLog(log: InsertScrapingLog): Promise<ScrapingLog>;
  updateScrapingLog(id: string, updates: Partial<ScrapingLog>): Promise<ScrapingLog | undefined>;
  
  // Statistics
  getStats(): Promise<{
    totalVehicles: number;
    sitesScraped: number;
    facebookPosts: number;
    successRate: number;
  }>;
}

export class MemStorage implements IStorage {
  private vehicles: Map<string, Vehicle>;
  private facebookGroups: Map<string, FacebookGroup>;
  private facebookPosts: Map<string, FacebookPost>;
  private scrapingLogs: Map<string, ScrapingLog>;

  constructor() {
    this.vehicles = new Map();
    this.facebookGroups = new Map();
    this.facebookPosts = new Map();
    this.scrapingLogs = new Map();
    
    // Add some sample groups
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample vehicles for testing Facebook Marketplace integration
    const sampleVehicles: Vehicle[] = [
      {
        id: randomUUID(),
        vin: "1HGBH41JXMN109186",
        make: "Honda",
        model: "Civic",
        year: 2021,
        trim: "Sport",
        price: "22995",
        mileage: 32145,
        transmission: "CVT Automatic",
        fuelType: "Gasoline",
        exteriorColor: "Crystal Black Pearl",
        interiorColor: "Black",
        features: ["Sunroof", "Backup Camera", "Bluetooth", "Apple CarPlay", "Alloy Wheels"],
        images: ["https://example.com/honda-civic-1.jpg"],
        description: "Well-maintained 2021 Honda Civic Sport with low miles. One owner, clean title.",
        sourceUrl: "https://autotrader.com/cars-for-sale/vehicledetails.xhtml?123",
        sourceSite: "AutoTrader",
        dealerName: "Metro Honda",
        dealerLocation: "Denver, CO",
        status: "scraped",
        scrapedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        postedAt: null,
        lastUpdated: new Date(),
      },
      {
        id: randomUUID(),
        vin: "5NPE24AF4FH123456",
        make: "Hyundai",
        model: "Elantra",
        year: 2015,
        trim: "SE",
        price: "14750",
        mileage: 87234,
        transmission: "6-Speed Manual",
        fuelType: "Gasoline",
        exteriorColor: "White",
        interiorColor: "Gray",
        features: ["Heated Seats", "Bluetooth", "USB Connectivity"],
        images: [],
        description: "Reliable 2015 Hyundai Elantra SE with manual transmission. Great gas mileage.",
        sourceUrl: "https://cars.com/vehicledetail/detail/456789/overview/",
        sourceSite: "Cars.com",
        dealerName: "City Auto Sales",
        dealerLocation: "Phoenix, AZ",
        status: "scraped",
        scrapedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        postedAt: null,
        lastUpdated: new Date(),
      },
      {
        id: randomUUID(),
        vin: "1FADP3F23FL123456",
        make: "Ford",
        model: "Focus",
        year: 2015,
        trim: "ST",
        price: "18995",
        mileage: 65432,
        transmission: "6-Speed Manual",
        fuelType: "Gasoline",
        exteriorColor: "Performance Blue",
        interiorColor: "Charcoal Black",
        features: ["Turbo Engine", "Sport Seats", "Navigation", "SYNC 3", "ST Styling Package"],
        images: ["https://example.com/ford-focus-st-1.jpg"],
        description: "2015 Ford Focus ST - Performance hatchback with turbo power.",
        sourceUrl: "https://cargurus.com/Cars/inventorylisting/123",
        sourceSite: "CarGurus",
        dealerName: "Performance Ford",
        dealerLocation: "Austin, TX",
        status: "scraped",
        scrapedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        postedAt: null,
        lastUpdated: new Date(),
      },
    ];

    const sampleGroups: FacebookGroup[] = [
      {
        id: randomUUID(),
        name: "BMW Enthusiasts",
        facebookId: "bmw_enthusiasts_123",
        url: "https://facebook.com/groups/bmw_enthusiasts",
        memberCount: 15000,
        isActive: true,
        lastPostedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        postCount: 45,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Used Cars for Sale",
        facebookId: "used_cars_456",
        url: "https://facebook.com/groups/used_cars_sale",
        memberCount: 32000,
        isActive: true,
        lastPostedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        postCount: 78,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Toyota Owners Club",
        facebookId: "toyota_owners_789",
        url: "https://facebook.com/groups/toyota_owners",
        memberCount: 8500,
        isActive: true,
        lastPostedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        postCount: 23,
        createdAt: new Date(),
      },
    ];

    // Add sample data to storage
    sampleVehicles.forEach(vehicle => {
      this.vehicles.set(vehicle.id, vehicle);
    });

    sampleGroups.forEach(group => {
      this.facebookGroups.set(group.id, group);
    });
  }

  async getVehicles(limit = 10, offset = 0): Promise<{ vehicles: Vehicle[], total: number }> {
    const allVehicles = Array.from(this.vehicles.values());
    const sortedVehicles = allVehicles.sort((a, b) => 
      (b.scrapedAt?.getTime() || 0) - (a.scrapedAt?.getTime() || 0)
    );
    
    return {
      vehicles: sortedVehicles.slice(offset, offset + limit),
      total: allVehicles.length,
    };
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getVehicleByVin(vin: string): Promise<Vehicle | undefined> {
    return Array.from(this.vehicles.values()).find(vehicle => vehicle.vin === vin);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = {
      ...insertVehicle,
      id,
      scrapedAt: new Date(),
      postedAt: null,
      lastUpdated: new Date(),
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const updatedVehicle = { ...vehicle, ...updates, lastUpdated: new Date() };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  async getFacebookGroups(): Promise<FacebookGroup[]> {
    return Array.from(this.facebookGroups.values());
  }

  async getFacebookGroup(id: string): Promise<FacebookGroup | undefined> {
    return this.facebookGroups.get(id);
  }

  async createFacebookGroup(insertGroup: InsertFacebookGroup): Promise<FacebookGroup> {
    const id = randomUUID();
    const group: FacebookGroup = {
      ...insertGroup,
      id,
      lastPostedAt: null,
      postCount: 0,
      createdAt: new Date(),
    };
    this.facebookGroups.set(id, group);
    return group;
  }

  async updateFacebookGroup(id: string, updates: Partial<FacebookGroup>): Promise<FacebookGroup | undefined> {
    const group = this.facebookGroups.get(id);
    if (!group) return undefined;
    
    const updatedGroup = { ...group, ...updates };
    this.facebookGroups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteFacebookGroup(id: string): Promise<boolean> {
    return this.facebookGroups.delete(id);
  }

  async getFacebookPosts(vehicleId?: string, groupId?: string): Promise<FacebookPost[]> {
    let posts = Array.from(this.facebookPosts.values());
    
    if (vehicleId) {
      posts = posts.filter(post => post.vehicleId === vehicleId);
    }
    
    if (groupId) {
      posts = posts.filter(post => post.groupId === groupId);
    }
    
    return posts.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createFacebookPost(insertPost: InsertFacebookPost): Promise<FacebookPost> {
    const id = randomUUID();
    const post: FacebookPost = {
      ...insertPost,
      id,
      facebookPostId: null,
      postedAt: null,
      createdAt: new Date(),
    };
    this.facebookPosts.set(id, post);
    return post;
  }

  async updateFacebookPost(id: string, updates: Partial<FacebookPost>): Promise<FacebookPost | undefined> {
    const post = this.facebookPosts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...updates };
    this.facebookPosts.set(id, updatedPost);
    return updatedPost;
  }

  async getScrapingLogs(limit = 10): Promise<ScrapingLog[]> {
    const logs = Array.from(this.scrapingLogs.values());
    return logs
      .sort((a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0))
      .slice(0, limit);
  }

  async createScrapingLog(insertLog: InsertScrapingLog): Promise<ScrapingLog> {
    const id = randomUUID();
    const log: ScrapingLog = {
      ...insertLog,
      id,
      startedAt: new Date(),
      completedAt: null,
      duration: null,
    };
    this.scrapingLogs.set(id, log);
    return log;
  }

  async updateScrapingLog(id: string, updates: Partial<ScrapingLog>): Promise<ScrapingLog | undefined> {
    const log = this.scrapingLogs.get(id);
    if (!log) return undefined;
    
    const updatedLog = { ...log, ...updates };
    if (updates.completedAt && log.startedAt) {
      updatedLog.duration = updates.completedAt.getTime() - log.startedAt.getTime();
    }
    this.scrapingLogs.set(id, updatedLog);
    return updatedLog;
  }

  async getStats(): Promise<{
    totalVehicles: number;
    sitesScraped: number;
    facebookPosts: number;
    successRate: number;
  }> {
    const totalVehicles = this.vehicles.size;
    const sitesScraped = new Set(Array.from(this.vehicles.values()).map(v => v.sourceSite)).size;
    const facebookPosts = this.facebookPosts.size;
    
    const successfulScrapes = Array.from(this.scrapingLogs.values()).filter(log => log.status === "success").length;
    const totalScrapes = this.scrapingLogs.size;
    const successRate = totalScrapes > 0 ? (successfulScrapes / totalScrapes) * 100 : 0;

    return {
      totalVehicles,
      sitesScraped,
      facebookPosts,
      successRate: Math.round(successRate * 10) / 10,
    };
  }
}

export const storage = new MemStorage();

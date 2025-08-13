import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVehicleSchema, insertFacebookGroupSchema, insertFacebookPostSchema, insertScrapingLogSchema } from "@shared/schema";

// Active scraping sessions for progress tracking
const activeScrapingSessions = new Map<string, {
  id: string;
  url: string;
  sourceSite: string;
  status: 'running' | 'paused' | 'cancelled' | 'success' | 'error';
  progress: number;
  currentAction?: string;
  vehiclesFound: number;
  vehiclesScraped: number;
  totalPages?: number;
  currentPage?: number;
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
}>();

// Generate session ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Helper to determine source site from URL
function getSourceSiteFromUrl(url: string): string {
  if (url.includes('autotrader.com')) return 'autotrader';
  if (url.includes('cars.com')) return 'cars';
  if (url.includes('cargurus.com')) return 'cargurus';
  if (url.includes('dealer.com')) return 'dealer';
  if (url.includes('carmax.com')) return 'carmax';
  return 'unknown';
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Vehicle routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const result = await storage.getVehicles(limit, offset);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(400).json({ error: "Invalid vehicle data" });
    }
  });

  app.patch("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.updateVehicle(req.params.id, req.body);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to update vehicle" });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteVehicle(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  // Facebook Groups routes
  app.get("/api/facebook-groups", async (req, res) => {
    try {
      const groups = await storage.getFacebookGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Facebook groups" });
    }
  });

  app.post("/api/facebook-groups", async (req, res) => {
    try {
      const groupData = insertFacebookGroupSchema.parse(req.body);
      const group = await storage.createFacebookGroup(groupData);
      res.status(201).json(group);
    } catch (error) {
      res.status(400).json({ error: "Invalid group data" });
    }
  });

  // Facebook Posts routes
  app.get("/api/facebook-posts", async (req, res) => {
    try {
      const vehicleId = req.query.vehicleId as string;
      const groupId = req.query.groupId as string;
      const posts = await storage.getFacebookPosts(vehicleId, groupId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Facebook posts" });
    }
  });

  app.post("/api/facebook-posts", async (req, res) => {
    try {
      const postData = insertFacebookPostSchema.parse(req.body);
      const post = await storage.createFacebookPost(postData);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  // Enhanced scraper routes with progress tracking
  app.post("/api/scraper/start", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      const sessionId = generateSessionId();
      const sourceSite = getSourceSiteFromUrl(url);
      
      // Create scraping session
      const session = {
        id: sessionId,
        url,
        sourceSite,
        status: 'running' as const,
        progress: 0,
        currentAction: 'scanning',
        vehiclesFound: 0,
        vehiclesScraped: 0,
        startedAt: new Date()
      };
      
      activeScrapingSessions.set(sessionId, session);

      // Create scraping log in storage
      await storage.createScrapingLog({
        url,
        sourceSite,
        status: 'running',
        vehiclesFound: 0,
        vehiclesScraped: 0
      });

      // Simulate scraping progress (in real implementation, this would be handled by Chrome extension)
      simulateScrapingProgress(sessionId);

      res.json({ 
        success: true, 
        sessionId,
        message: "Scraping started successfully" 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to start scraping" });
    }
  });

  // Progress tracking routes
  app.get("/api/scraper/progress/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = activeScrapingSessions.get(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.post("/api/scraper/stop/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = activeScrapingSessions.get(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      session.status = 'cancelled';
      session.completedAt = new Date();
      session.duration = session.completedAt.getTime() - session.startedAt.getTime();
      
      res.json({ success: true, message: "Scraping stopped" });
    } catch (error) {
      res.status(500).json({ error: "Failed to stop scraping" });
    }
  });

  app.post("/api/scraper/pause/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = activeScrapingSessions.get(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      session.status = 'paused';
      res.json({ success: true, message: "Scraping paused" });
    } catch (error) {
      res.status(500).json({ error: "Failed to pause scraping" });
    }
  });

  app.post("/api/scraper/resume/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = activeScrapingSessions.get(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      session.status = 'running';
      res.json({ success: true, message: "Scraping resumed" });
    } catch (error) {
      res.status(500).json({ error: "Failed to resume scraping" });
    }
  });

  // Statistics route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Scraping logs route
  app.get("/api/scraping-logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const logs = await storage.getScrapingLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scraping logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Simulate scraping progress for demo purposes
function simulateScrapingProgress(sessionId: string) {
  const session = activeScrapingSessions.get(sessionId);
  if (!session) return;

  let progress = 0;
  let vehiclesFound = 0;
  let currentPage = 1;
  const totalPages = Math.floor(Math.random() * 5) + 3; // 3-7 pages
  
  const interval = setInterval(async () => {
    const session = activeScrapingSessions.get(sessionId);
    if (!session || session.status !== 'running') {
      clearInterval(interval);
      return;
    }

    // Simulate progress
    progress += Math.floor(Math.random() * 15) + 5; // 5-20% increments
    if (progress > 100) progress = 100;
    
    // Simulate finding vehicles
    if (Math.random() > 0.3) {
      vehiclesFound += Math.floor(Math.random() * 3) + 1; // 1-3 vehicles per update
    }

    // Update session
    session.progress = progress;
    session.vehiclesFound = vehiclesFound;
    session.vehiclesScraped = Math.floor(vehiclesFound * 0.8); // 80% success rate
    session.totalPages = totalPages;
    session.currentPage = Math.min(currentPage, totalPages);
    
    // Update current action
    if (progress < 30) session.currentAction = 'scanning';
    else if (progress < 70) session.currentAction = 'extracting';
    else if (progress < 100) session.currentAction = 'validating';
    else session.currentAction = undefined;

    // Complete when progress reaches 100%
    if (progress >= 100) {
      session.status = 'success';
      session.completedAt = new Date();
      session.duration = session.completedAt.getTime() - session.startedAt.getTime();
      session.currentAction = undefined;
      
      // Create some sample vehicles
      for (let i = 0; i < session.vehiclesScraped; i++) {
        try {
          await storage.createVehicle({
            vin: generateSampleVIN(),
            make: getRandomMake(),
            model: getRandomModel(),
            year: 2020 + Math.floor(Math.random() * 4),
            price: (Math.random() * 50000 + 15000).toString(),
            mileage: Math.floor(Math.random() * 100000),
            sourceUrl: session.url,
            sourceSite: session.sourceSite
          });
        } catch (error) {
          console.error('Failed to create sample vehicle:', error);
        }
      }
      
      clearInterval(interval);
    }

    currentPage++;
  }, 2000); // Update every 2 seconds
}

// Helper functions for sample data
function generateSampleVIN(): string {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  let vin = '';
  for (let i = 0; i < 17; i++) {
    vin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return vin;
}

function getRandomMake(): string {
  const makes = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Nissan', 'Hyundai'];
  return makes[Math.floor(Math.random() * makes.length)];
}

function getRandomModel(): string {
  const models = ['Camry', 'Accord', 'F-150', '3 Series', 'C-Class', 'A4', 'Altima', 'Elantra'];
  return models[Math.floor(Math.random() * models.length)];
}

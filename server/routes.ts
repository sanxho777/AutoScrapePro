import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVehicleSchema, insertFacebookGroupSchema, insertFacebookPostSchema, insertScrapingLogSchema } from "@shared/schema";

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

  // Scraping routes
  app.post("/api/scrape", async (req, res) => {
    try {
      const { url, sourceSite } = req.body;
      
      if (!url || !sourceSite) {
        return res.status(400).json({ error: "URL and source site are required" });
      }

      // Create scraping log
      const log = await storage.createScrapingLog({
        url,
        sourceSite,
        status: "success",
        vehiclesFound: 0,
        vehiclesScraped: 0,
      });

      // In a real implementation, this would trigger the Chrome extension
      // For now, we'll return a success response
      res.json({ 
        success: true, 
        message: "Scraping initiated. Check Chrome extension for progress.",
        logId: log.id 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to initiate scraping" });
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

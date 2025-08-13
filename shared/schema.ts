import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vin: varchar("vin", { length: 17 }).notNull().unique(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  trim: text("trim"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  mileage: integer("mileage").notNull(),
  transmission: text("transmission"),
  fuelType: text("fuel_type"),
  exteriorColor: text("exterior_color"),
  interiorColor: text("interior_color"),
  features: jsonb("features").$type<string[]>().default([]),
  images: jsonb("images").$type<string[]>().default([]),
  description: text("description"),
  sourceUrl: text("source_url").notNull(),
  sourceSite: text("source_site").notNull(),
  dealerName: text("dealer_name"),
  dealerLocation: text("dealer_location"),
  status: text("status").notNull().default("scraped"), // scraped, posted, failed
  scrapedAt: timestamp("scraped_at").defaultNow(),
  postedAt: timestamp("posted_at"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const facebookGroups = pgTable("facebook_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  facebookId: text("facebook_id").notNull().unique(),
  url: text("url").notNull(),
  memberCount: integer("member_count"),
  isActive: boolean("is_active").default(true),
  lastPostedAt: timestamp("last_posted_at"),
  postCount: integer("post_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const facebookPosts = pgTable("facebook_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  groupId: varchar("group_id").notNull().references(() => facebookGroups.id),
  facebookPostId: text("facebook_post_id"),
  content: text("content").notNull(),
  status: text("status").notNull().default("pending"), // pending, posted, failed
  postedAt: timestamp("posted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scrapingLogs = pgTable("scraping_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  sourceSite: text("source_site").notNull(),
  status: text("status").notNull(), // running, success, error, paused, cancelled
  vehiclesFound: integer("vehicles_found").default(0),
  vehiclesScraped: integer("vehicles_scraped").default(0),
  totalPages: integer("total_pages"),
  currentPage: integer("current_page"),
  progress: integer("progress"), // percentage 0-100
  currentAction: text("current_action"), // scanning, extracting, validating
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // in milliseconds
});

// Insert schemas
export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  scrapedAt: true,
  postedAt: true,
  lastUpdated: true,
});

export const insertFacebookGroupSchema = createInsertSchema(facebookGroups).omit({
  id: true,
  createdAt: true,
  lastPostedAt: true,
  postCount: true,
});

export const insertFacebookPostSchema = createInsertSchema(facebookPosts).omit({
  id: true,
  createdAt: true,
  postedAt: true,
});

export const insertScrapingLogSchema = createInsertSchema(scrapingLogs).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

// Types
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type FacebookGroup = typeof facebookGroups.$inferSelect;
export type InsertFacebookGroup = z.infer<typeof insertFacebookGroupSchema>;
export type FacebookPost = typeof facebookPosts.$inferSelect;
export type InsertFacebookPost = z.infer<typeof insertFacebookPostSchema>;
export type ScrapingLog = typeof scrapingLogs.$inferSelect;
export type InsertScrapingLog = z.infer<typeof insertScrapingLogSchema>;

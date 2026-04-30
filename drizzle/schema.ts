import { integer, pgTable, text, timestamp, varchar, numeric, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Admin credentials table for simple login
 */
export const adminCredentials = pgTable("admin_credentials", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AdminCredential = typeof adminCredentials.$inferSelect;
export type InsertAdminCredential = typeof adminCredentials.$inferInsert;

/**
 * Construction projects table
 * Stores project information with access codes for client viewing
 */
export const projects = pgTable("projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  ownerId: integer("ownerId").notNull(), // References users.id
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  accessCode: varchar("accessCode", { length: 12 }).notNull().unique(), // Unique code for client access
  progressPercentage: numeric("progressPercentage", { precision: 5, scale: 2 }).default("0").notNull(),
  structureProgress: numeric("structureProgress", { precision: 5, scale: 2 }).default("0").notNull(),
  systemsProgress: numeric("systemsProgress", { precision: 5, scale: 2 }).default("0").notNull(),
  interiorProgress: numeric("interiorProgress", { precision: 5, scale: 2 }).default("0").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Project updates table
 * Stores construction progress updates with category classification
 */
export const projectUpdates = pgTable("project_updates", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  projectId: integer("projectId").notNull(), // References projects.id
  category: varchar("category", { length: 50 }).notNull(), // "Structure", "Systems", "Interior Finishing"
  description: text("description"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ProjectUpdate = typeof projectUpdates.$inferSelect;
export type InsertProjectUpdate = typeof projectUpdates.$inferInsert;

/**
 * Update images table
 * Stores image references for project updates (using file storage)
 */
export const updateImages = pgTable("update_images", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  updateId: integer("updateId").notNull(), // References projectUpdates.id
  imageUrl: varchar("imageUrl", { length: 512 }).notNull(), // URL from file storage
  imageKey: varchar("imageKey", { length: 255 }).notNull(), // Storage key for reference
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UpdateImage = typeof updateImages.$inferSelect;
export type InsertUpdateImage = typeof updateImages.$inferInsert;

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  updates: many(projectUpdates),
}));

export const projectUpdatesRelations = relations(projectUpdates, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectUpdates.projectId],
    references: [projects.id],
  }),
  images: many(updateImages),
}));

export const updateImagesRelations = relations(updateImages, ({ one }) => ({
  update: one(projectUpdates, {
    fields: [updateImages.updateId],
    references: [projectUpdates.id],
  }),
}));

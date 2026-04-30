import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Construction projects table
 * Stores project information with access codes for client viewing
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(), // References users.id
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  accessCode: varchar("accessCode", { length: 12 }).notNull().unique(), // Unique code for client access
  progressPercentage: decimal("progressPercentage", { precision: 5, scale: 2 }).default("0").notNull(),
  structureProgress: decimal("structureProgress", { precision: 5, scale: 2 }).default("0").notNull(),
  systemsProgress: decimal("systemsProgress", { precision: 5, scale: 2 }).default("0").notNull(),
  interiorProgress: decimal("interiorProgress", { precision: 5, scale: 2 }).default("0").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Project updates table
 * Stores construction progress updates with category classification
 */
export const projectUpdates = mysqlTable("project_updates", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(), // References projects.id
  category: mysqlEnum("category", ["Structure", "Systems", "Interior Finishing"]).notNull(),
  description: text("description"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectUpdate = typeof projectUpdates.$inferSelect;
export type InsertProjectUpdate = typeof projectUpdates.$inferInsert;

/**
 * Update images table
 * Stores image references for project updates (using file storage)
 */
export const updateImages = mysqlTable("update_images", {
  id: int("id").autoincrement().primaryKey(),
  updateId: int("updateId").notNull(), // References projectUpdates.id
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

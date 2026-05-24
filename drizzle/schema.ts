import { integer, pgTable, text, timestamp, varchar, numeric, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).unique(), // Made optional to allow password-only users
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }), // Added for direct login
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(), // 'admin', 'contractor', 'client', 'user'
  phone: varchar("phone", { length: 20 }),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Contractors table for managing construction professionals
 */
export const contractors = pgTable("contractors", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").references(() => users.id), // Optional link to a user account
  companyName: varchar("companyName", { length: 255 }).notNull(),
  contactName: varchar("contactName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  specialty: varchar("specialty", { length: 100 }), // e.g., 'Electrical', 'Plumbing'
  address: text("address"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = typeof contractors.$inferInsert;

/**
 * Construction projects table
 */
export const projects = pgTable("projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  ownerId: integer("ownerId").notNull().references(() => users.id),
  contractorId: integer("contractorId").references(() => contractors.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  location: text("location"),
  budget: numeric("budget", { precision: 12, scale: 2 }),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  // Scope flags
  hasStructure: boolean("hasStructure").default(true).notNull(),
  hasSystems: boolean("hasSystems").default(true).notNull(),
  hasInterior: boolean("hasInterior").default(true).notNull(),
  
  // Weights (0-100)
  structureWeight: integer("structureWeight").default(33),
  systemsWeight: integer("systemsWeight").default(33),
  interiorWeight: integer("interiorWeight").default(34),

  accessCode: varchar("accessCode", { length: 12 }).notNull().unique(),
  progressPercentage: numeric("progressPercentage", { precision: 5, scale: 2 }).default("0").notNull(),
  structureProgress: numeric("structureProgress", { precision: 5, scale: 2 }).default("0").notNull(),
  systemsProgress: numeric("systemsProgress", { precision: 5, scale: 2 }).default("0").notNull(),
  interiorProgress: numeric("interiorProgress", { precision: 5, scale: 2 }).default("0").notNull(),
  structureStatus: varchar("structureStatus", { length: 50 }).default("ยังไม่เริ่ม").notNull(),
  systemsStatus: varchar("systemsStatus", { length: 50 }).default("ยังไม่เริ่ม").notNull(),
  interiorStatus: varchar("interiorStatus", { length: 50 }).default("ยังไม่เริ่ม").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Project tasks for granular tracking
 */
export const tasks = pgTable("tasks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  projectId: integer("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // 'pending', 'in_progress', 'completed', 'delayed'
  priority: varchar("priority", { length: 20 }).default("medium").notNull(), // 'low', 'medium', 'high', 'urgent'
  category: varchar("category", { length: 50 }), // 'Structure', 'Systems', 'Interior'
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Materials table for cost and inventory tracking
 */
export const materials = pgTable("materials", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  projectId: integer("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(), // e.g., 'bags', 'meters', 'pieces'
  unitPrice: numeric("unitPrice", { precision: 12, scale: 2 }),
  totalPrice: numeric("totalPrice", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 50 }).default("ordered").notNull(), // 'ordered', 'delivered', 'used'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

/**
 * Project updates table
 */
export const projectUpdates = pgTable("project_updates", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  projectId: integer("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 50 }).notNull(),
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
  updateId: integer("updateId").notNull().references(() => projectUpdates.id, { onDelete: "cascade" }),
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

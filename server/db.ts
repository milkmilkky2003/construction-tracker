import { eq, sql, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  InsertUser, users, 
  projects, InsertProject,
  projectUpdates, InsertProjectUpdate, 
  updateImages, InsertUpdateImage,
  contractors, InsertContractor,
  tasks, InsertTask,
  materials, InsertMaterial
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { storageDelete } from "./storage";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, { prepare: false });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { ...user };
    
    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (user.openId) {
      await db.insert(users).values(values).onConflictDoUpdate({
        target: users.openId,
        set: values,
      });
    } else if (user.email) {
      await db.insert(users).values(values).onConflictDoUpdate({
        target: users.email,
        set: values,
      });
    } else {
      await db.insert(users).values(values);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Projects queries
export async function getProjectsByOwner(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.ownerId, ownerId));
}

export async function getProjectByAccessCode(accessCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const trimmedCode = accessCode.trim().toUpperCase();
  const result = await db.select().from(projects).where(sql`UPPER(${projects.accessCode}) = ${trimmedCode}`).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProjectById(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(data).returning();
  return result[0];
}

export async function updateProject(projectId: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(projects).set(data).where(eq(projects.id, projectId));
}

export async function deleteProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates = await getProjectUpdates(projectId);
  for (const update of updates) {
    await deleteProjectUpdate(update.id);
  }
  return db.delete(projects).where(eq(projects.id, projectId));
}

// Project Updates queries
export async function getProjectUpdates(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projectUpdates).where(eq(projectUpdates.projectId, projectId));
}

export async function getProjectUpdateWithImages(updateId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const update = await db.select().from(projectUpdates).where(eq(projectUpdates.id, updateId)).limit(1);
  if (update.length === 0) return undefined;
  const images = await db.select().from(updateImages).where(eq(updateImages.updateId, updateId));
  return { ...update[0], images };
}

export async function getProjectUpdateById(updateId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projectUpdates).where(eq(projectUpdates.id, updateId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProjectUpdate(data: InsertProjectUpdate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projectUpdates).values(data).returning();
  return result[0];
}

export async function deleteProjectUpdate(updateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete associated images from storage first
  const images = await db.select().from(updateImages).where(eq(updateImages.updateId, updateId));
  for (const image of images) {
    if (image.imageKey) {
      await storageDelete(image.imageKey);
    }
  }
  // Delete associated image records
  await db.delete(updateImages).where(eq(updateImages.updateId, updateId));
  return db.delete(projectUpdates).where(eq(projectUpdates.id, updateId));
}

export async function updateProjectUpdate(updateId: number, data: Partial<InsertProjectUpdate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(projectUpdates).set(data).where(eq(projectUpdates.id, updateId));
}

export async function deleteUpdateImage(imageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(updateImages).where(eq(updateImages.id, imageId)).limit(1);
  if (result.length > 0 && result[0].imageKey) {
    await storageDelete(result[0].imageKey);
  }
  return db.delete(updateImages).where(eq(updateImages.id, imageId));
}

// Update Images queries
export async function createUpdateImage(data: InsertUpdateImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(updateImages).values(data).returning();
  return result[0];
}

export async function getUpdateImages(updateId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(updateImages).where(eq(updateImages.updateId, updateId));
}

// Contractors queries
export async function createContractor(data: InsertContractor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contractors).values(data).returning();
  return result[0];
}

export async function getContractors() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contractors);
}

// Tasks queries
export async function createBatchTasks(data: InsertTask[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(tasks).values(data).returning();
}

export async function getProjectTasks(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.projectId, projectId));
}

// Materials queries
export async function createMaterial(data: InsertMaterial) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(materials).values(data).returning();
  return result[0];
}

export async function getProjectMaterials(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(materials).where(eq(materials.projectId, projectId));
}

// Admin credentials - Map to users table
export async function getAdminByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  // Try email as username
  const result = await db.select().from(users).where(eq(users.email, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

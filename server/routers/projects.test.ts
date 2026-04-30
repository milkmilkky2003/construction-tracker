import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { projectsRouter } from "./projects";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";
import * as db from "../db";

// Mock database functions
vi.mock("../db", () => ({
  getProjectsByOwner: vi.fn(),
  getProjectByAccessCode: vi.fn(),
  getProjectById: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  getProjectUpdates: vi.fn(),
  createProjectUpdate: vi.fn(),
  deleteProjectUpdate: vi.fn(),
  createUpdateImage: vi.fn(),
  getUpdateImages: vi.fn(),
}));

function createMockContext(user: User | null): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {
      clearCookie: vi.fn(),
    } as any,
  };
}

const mockAdmin: User = {
  id: 1,
  openId: "admin-user",
  email: "admin@example.com",
  name: "Admin User",
  loginMethod: "manus",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const mockRegularUser: User = {
  id: 2,
  openId: "regular-user",
  email: "user@example.com",
  name: "Regular User",
  loginMethod: "manus",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("projectsRouter", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("list - Admin projects", () => {
    it("should return projects for admin user", async () => {
      const mockProjects = [
        {
          id: 1,
          ownerId: 1,
          name: "Project A",
          description: "Test project",
          startDate: new Date(),
          endDate: new Date(),
          accessCode: "ABC12345",
          progressPercentage: "50",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getProjectsByOwner).mockResolvedValue(mockProjects);

      const ctx = createMockContext(mockAdmin);
      const caller = projectsRouter.createCaller(ctx);
      const result = await caller.list();

      expect(result).toEqual(mockProjects);
      expect(db.getProjectsByOwner).toHaveBeenCalledWith(mockAdmin.id);
    });

    it("should reject non-admin users", async () => {
      const ctx = createMockContext(mockRegularUser);
      const caller = projectsRouter.createCaller(ctx);

      await expect(caller.list()).rejects.toThrow();
    });

    it("should reject unauthenticated users", async () => {
      const ctx = createMockContext(null);
      const caller = projectsRouter.createCaller(ctx);

      await expect(caller.list()).rejects.toThrow();
    });
  });

  describe("create - Create project", () => {
    it("should create project for admin user", async () => {
      vi.mocked(db.createProject).mockResolvedValue({ id: 1 } as any);

      const ctx = createMockContext(mockAdmin);
      const caller = projectsRouter.createCaller(ctx);

      const result = await caller.create({
        name: "New Project",
        description: "Test description",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-12-31"),
      });

      expect(result).toHaveProperty("accessCode");
      expect(result.accessCode).toMatch(/^[A-Z0-9]{8}$/);
      expect(db.createProject).toHaveBeenCalled();
    });

    it("should reject non-admin users", async () => {
      const ctx = createMockContext(mockRegularUser);
      const caller = projectsRouter.createCaller(ctx);

      await expect(
        caller.create({
          name: "New Project",
        })
      ).rejects.toThrow();
    });
  });

  describe("getDetail - Get project detail", () => {
    it("should return project detail for owner", async () => {
      const mockProject = {
        id: 1,
        ownerId: 1,
        name: "Project A",
        description: "Test project",
        startDate: new Date(),
        endDate: new Date(),
        accessCode: "ABC12345",
        progressPercentage: "50",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdates = [
        {
          id: 1,
          projectId: 1,
          category: "Structure" as const,
          description: "Foundation work",
          uploadedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getProjectById).mockResolvedValue(mockProject);
      vi.mocked(db.getProjectUpdates).mockResolvedValue(mockUpdates);
      vi.mocked(db.getUpdateImages).mockResolvedValue([]);

      const ctx = createMockContext(mockAdmin);
      const caller = projectsRouter.createCaller(ctx);

      const result = await caller.getDetail({ projectId: 1 });

      expect(result.project).toEqual(mockProject);
      expect(result.updates).toHaveLength(1);
      expect(result.updates[0].images).toEqual([]);
    });

    it("should reject access to other user's projects", async () => {
      const mockProject = {
        id: 1,
        ownerId: 999, // Different owner
        name: "Project A",
        description: "Test project",
        startDate: new Date(),
        endDate: new Date(),
        accessCode: "ABC12345",
        progressPercentage: "50",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getProjectById).mockResolvedValue(mockProject);

      const ctx = createMockContext(mockAdmin);
      const caller = projectsRouter.createCaller(ctx);

      await expect(caller.getDetail({ projectId: 1 })).rejects.toThrow("Unauthorized");
    });

    it("should reject non-existent projects", async () => {
      vi.mocked(db.getProjectById).mockResolvedValue(undefined);

      const ctx = createMockContext(mockAdmin);
      const caller = projectsRouter.createCaller(ctx);

      await expect(caller.getDetail({ projectId: 999 })).rejects.toThrow("Project not found");
    });
  });

  describe("verifyAccessCode - Public access code verification", () => {
    it("should verify valid access code", async () => {
      const mockProject = {
        id: 1,
        ownerId: 1,
        name: "Project A",
        description: "Test project",
        startDate: new Date(),
        endDate: new Date(),
        accessCode: "ABC12345",
        progressPercentage: "50",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getProjectByAccessCode).mockResolvedValue(mockProject);

      const ctx = createMockContext(null); // Public access
      const caller = projectsRouter.createCaller(ctx);

      const result = await caller.verifyAccessCode({ accessCode: "ABC12345" });

      expect(result).toEqual({ valid: true, projectName: "Project A" });
    });

    it("should reject invalid access code", async () => {
      vi.mocked(db.getProjectByAccessCode).mockResolvedValue(undefined);

      const ctx = createMockContext(null); // Public access
      const caller = projectsRouter.createCaller(ctx);

      const result = await caller.verifyAccessCode({ accessCode: "INVALID" });

      expect(result).toEqual({ valid: false });
    });
  });

  describe("getByAccessCode - Client project retrieval", () => {
    it("should return project for valid access code", async () => {
      const mockProject = {
        id: 1,
        ownerId: 1,
        name: "Project A",
        description: "Test project",
        startDate: new Date(),
        endDate: new Date(),
        accessCode: "ABC12345",
        progressPercentage: "50",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdates = [
        {
          id: 1,
          projectId: 1,
          category: "Structure" as const,
          description: "Foundation work",
          uploadedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getProjectByAccessCode).mockResolvedValue(mockProject);
      vi.mocked(db.getProjectUpdates).mockResolvedValue(mockUpdates);
      vi.mocked(db.getUpdateImages).mockResolvedValue([]);

      const ctx = createMockContext(null); // Public access
      const caller = projectsRouter.createCaller(ctx);

      const result = await caller.getByAccessCode({ accessCode: "ABC12345" });

      expect(result.project).toEqual(mockProject);
      expect(result.updates).toHaveLength(1);
    });

    it("should reject invalid access code", async () => {
      vi.mocked(db.getProjectByAccessCode).mockResolvedValue(undefined);

      const ctx = createMockContext(null); // Public access
      const caller = projectsRouter.createCaller(ctx);

      await expect(caller.getByAccessCode({ accessCode: "INVALID" })).rejects.toThrow("Invalid access code");
    });
  });

  describe("regenerateAccessCode - Regenerate access code", () => {
    it("should regenerate access code for project owner", async () => {
      const mockProject = {
        id: 1,
        ownerId: 1,
        name: "Project A",
        description: "Test project",
        startDate: new Date(),
        endDate: new Date(),
        accessCode: "ABC12345",
        progressPercentage: "50",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getProjectById).mockResolvedValue(mockProject);
      vi.mocked(db.updateProject).mockResolvedValue({} as any);

      const ctx = createMockContext(mockAdmin);
      const caller = projectsRouter.createCaller(ctx);

      const result = await caller.regenerateAccessCode({ projectId: 1 });

      expect(result).toHaveProperty("accessCode");
      expect(result.accessCode).toMatch(/^[A-Z0-9]{8}$/);
      expect(db.updateProject).toHaveBeenCalled();
    });

    it("should reject non-owner access", async () => {
      const mockProject = {
        id: 1,
        ownerId: 999, // Different owner
        name: "Project A",
        description: "Test project",
        startDate: new Date(),
        endDate: new Date(),
        accessCode: "ABC12345",
        progressPercentage: "50",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getProjectById).mockResolvedValue(mockProject);

      const ctx = createMockContext(mockAdmin);
      const caller = projectsRouter.createCaller(ctx);

      await expect(caller.regenerateAccessCode({ projectId: 1 })).rejects.toThrow("Unauthorized");
    });
  });

  describe("uploadUpdate - Upload project update", () => {
    it("should upload update for project owner", async () => {
      const mockProject = {
        id: 1,
        ownerId: 1,
        name: "Project A",
        description: "Test project",
        startDate: new Date(),
        endDate: new Date(),
        accessCode: "ABC12345",
        progressPercentage: "50",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getProjectById).mockResolvedValue(mockProject);
      vi.mocked(db.createProjectUpdate).mockResolvedValue({ id: 1 } as any);
      vi.mocked(db.createUpdateImage).mockResolvedValue({} as any);

      const ctx = createMockContext(mockAdmin);
      const caller = projectsRouter.createCaller(ctx);

      const result = await caller.uploadUpdate({
        projectId: 1,
        category: "Structure",
        description: "Foundation work",
        imageUrls: ["/manus-storage/image1.jpg"],
      });

      expect(result).toEqual({ success: true, updateId: 1 });
      expect(db.createProjectUpdate).toHaveBeenCalled();
      expect(db.createUpdateImage).toHaveBeenCalled();
    });

    it("should reject non-owner upload", async () => {
      const mockProject = {
        id: 1,
        ownerId: 999, // Different owner
        name: "Project A",
        description: "Test project",
        startDate: new Date(),
        endDate: new Date(),
        accessCode: "ABC12345",
        progressPercentage: "50",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getProjectById).mockResolvedValue(mockProject);

      const ctx = createMockContext(mockAdmin);
      const caller = projectsRouter.createCaller(ctx);

      await expect(
        caller.uploadUpdate({
          projectId: 1,
          category: "Structure",
          description: "Foundation work",
          imageUrls: [],
        })
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("deleteUpdate - Delete project update", () => {
    it("should delete update", async () => {
      vi.mocked(db.deleteProjectUpdate).mockResolvedValue({} as any);

      const ctx = createMockContext(mockAdmin);
      const caller = projectsRouter.createCaller(ctx);

      const result = await caller.deleteUpdate({ updateId: 1 });

      expect(result).toEqual({ success: true });
      expect(db.deleteProjectUpdate).toHaveBeenCalledWith(1);
    });
  });

  describe("delete - Delete project", () => {
    it("should delete project for owner", async () => {
      const mockProject = {
        id: 1,
        ownerId: 1,
        name: "Project A",
        description: "Test project",
        startDate: new Date(),
        endDate: new Date(),
        accessCode: "ABC12345",
        progressPercentage: "50",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getProjectById).mockResolvedValue(mockProject);
      vi.mocked(db.deleteProject).mockResolvedValue({} as any);

      const ctx = createMockContext(mockAdmin);
      const caller = projectsRouter.createCaller(ctx);

      const result = await caller.delete({ projectId: 1 });

      expect(result).toEqual({ success: true });
      expect(db.deleteProject).toHaveBeenCalledWith(1);
    });

    it("should reject non-owner delete", async () => {
      const mockProject = {
        id: 1,
        ownerId: 999, // Different owner
        name: "Project A",
        description: "Test project",
        startDate: new Date(),
        endDate: new Date(),
        accessCode: "ABC12345",
        progressPercentage: "50",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getProjectById).mockResolvedValue(mockProject);

      const ctx = createMockContext(mockAdmin);
      const caller = projectsRouter.createCaller(ctx);

      await expect(caller.delete({ projectId: 1 })).rejects.toThrow("Unauthorized");
    });
  });
});

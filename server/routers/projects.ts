import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getProjectsByOwner,
  getProjectByAccessCode,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectUpdates,
  getProjectUpdateById,
  createProjectUpdate,
  deleteProjectUpdate,
  updateProjectUpdate,
  deleteUpdateImage,
  createUpdateImage,
  getUpdateImages,
} from "../db";
import { customAlphabet } from "nanoid";
import { storagePut } from "../storage";

const generateAccessCode = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);
const uploadImageInput = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  dataUrl: z.string().min(1),
});

function imageDataUrlToBuffer(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data");

  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

function safeImageFileName(fileName: string) {
  return fileName
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "image";
}

export const projectsRouter = router({
  // Admin: Get all projects for owner (owner only)
  list: adminProcedure.query(async ({ ctx }) => {
    return getProjectsByOwner(ctx.user.id);
  }),

  // Admin: Get project detail (owner only)
  getDetail: adminProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await getProjectById(input.projectId);
      if (!project) throw new Error("Project not found");
      if (project.ownerId !== ctx.user.id) throw new Error("Unauthorized");
      const updates = await getProjectUpdates(input.projectId);
      const updatesWithImages = await Promise.all(
        updates.map(async (update) => {
          const images = await getUpdateImages(update.id);
          return { ...update, images };
        })
      );
      return { project, updates: updatesWithImages };
    }),

  // Admin: Create project
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Project name is required"),
        description: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        hasStructure: z.boolean(),
        hasSystems: z.boolean(),
        hasInterior: z.boolean(),
        structureWeight: z.number(),
        systemsWeight: z.number(),
        interiorWeight: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const accessCode = generateAccessCode();
      const result = await createProject({
        ownerId: ctx.user.id,
        name: input.name,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        accessCode,
        progressPercentage: "0",
        isActive: true,
        hasStructure: input.hasStructure,
        hasSystems: input.hasSystems,
        hasInterior: input.hasInterior,
        structureWeight: input.structureWeight,
        systemsWeight: input.systemsWeight,
        interiorWeight: input.interiorWeight,
      });
      return { accessCode };
    }),

  // Admin: Update project (owner only)
  update: adminProcedure
    .input(
      z.object({
        projectId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        progressPercentage: z.string().optional(),
        structureProgress: z.string().optional(),
        systemsProgress: z.string().optional(),
        interiorProgress: z.string().optional(),
        structureStatus: z.string().optional(),
        systemsStatus: z.string().optional(),
        interiorStatus: z.string().optional(),
        hasStructure: z.boolean().optional(),
        hasSystems: z.boolean().optional(),
        hasInterior: z.boolean().optional(),
        structureWeight: z.number().optional(),
        systemsWeight: z.number().optional(),
        interiorWeight: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await getProjectById(input.projectId);
      if (!project) throw new Error("Project not found");
      if (project.ownerId !== ctx.user.id) throw new Error("Unauthorized");
      await updateProject(input.projectId, {
        name: input.name,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        progressPercentage: input.progressPercentage,
        structureProgress: input.structureProgress,
        systemsProgress: input.systemsProgress,
        interiorProgress: input.interiorProgress,
        structureStatus: input.structureStatus,
        systemsStatus: input.systemsStatus,
        interiorStatus: input.interiorStatus,
        hasStructure: input.hasStructure,
        hasSystems: input.hasSystems,
        hasInterior: input.hasInterior,
        structureWeight: input.structureWeight,
        systemsWeight: input.systemsWeight,
        interiorWeight: input.interiorWeight,
      });
      return { success: true };
    }),

  // Admin: Delete project (owner only)
  delete: adminProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await getProjectById(input.projectId);
      if (!project) throw new Error("Project not found");
      if (project.ownerId !== ctx.user.id) throw new Error("Unauthorized");
      await deleteProject(input.projectId);
      return { success: true };
    }),

  // Admin: Regenerate access code (owner only)
  regenerateAccessCode: adminProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await getProjectById(input.projectId);
      if (!project) throw new Error("Project not found");
      if (project.ownerId !== ctx.user.id) throw new Error("Unauthorized");
      const newAccessCode = generateAccessCode();
      await updateProject(input.projectId, { accessCode: newAccessCode });
      return { accessCode: newAccessCode };
    }),

  // Client: Verify and get project by access code
  getByAccessCode: publicProcedure
    .input(z.object({ accessCode: z.string() }))
    .query(async ({ input }) => {
      const project = await getProjectByAccessCode(input.accessCode);
      if (!project) throw new Error("Invalid access code");
      const updates = await getProjectUpdates(project.id);
      const updatesWithImages = await Promise.all(
        updates.map(async (update) => {
          const images = await getUpdateImages(update.id);
          return { ...update, images };
        })
      );
      return { project, updates: updatesWithImages };
    }),

  // Admin: Upload project update with images (owner only)
  uploadUpdate: adminProcedure
    .input(
      z.object({
        projectId: z.number(),
        category: z.enum(["Structure", "Systems", "Interior Finishing"]),
        description: z.string(),
        imageUrls: z.array(z.string()).optional(),
        images: z.array(uploadImageInput).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await getProjectById(input.projectId);
      if (!project) throw new Error("Project not found");
      if (project.ownerId !== ctx.user.id) throw new Error("Unauthorized");

      // Create project update
      const update = await createProjectUpdate({
        projectId: input.projectId,
        category: input.category,
        description: input.description,
        uploadedAt: new Date(),
      });

      const updateId = update.id;
      const imageUrls = [...(input.imageUrls ?? [])];

      for (const image of input.images ?? []) {
        const { contentType, buffer } = imageDataUrlToBuffer(image.dataUrl);
        if (!contentType.startsWith("image/")) {
          throw new Error("Only image uploads are supported");
        }

        const stored = await storagePut(
          `projects/${input.projectId}/updates/${updateId}/${safeImageFileName(image.fileName)}`,
          buffer,
          image.contentType || contentType,
        );
        imageUrls.push(stored.url);
      }

      for (const imageUrl of imageUrls) {
        await createUpdateImage({
          updateId,
          imageUrl,
          imageKey: imageUrl, // Use URL as key for reference
        });
      }

      return { success: true, updateId };
    }),

  // Admin: Update project update (owner only)
  updateUpdate: adminProcedure
    .input(
      z.object({
        updateId: z.number(),
        category: z.enum(["Structure", "Systems", "Interior Finishing"]).optional(),
        description: z.string().optional(),
        deleteImageIds: z.array(z.number()).optional(),
        images: z.array(uploadImageInput).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const update = await getProjectUpdateById(input.updateId);
      if (!update) throw new Error("Update not found");
      const project = await getProjectById(update.projectId);
      if (!project) throw new Error("Project not found");
      if (project.ownerId !== ctx.user.id) throw new Error("Unauthorized");

      // Update basic fields
      await updateProjectUpdate(input.updateId, {
        category: input.category,
        description: input.description,
        updatedAt: new Date(),
      });

      // Delete images
      if (input.deleteImageIds && input.deleteImageIds.length > 0) {
        for (const imageId of input.deleteImageIds) {
          await deleteUpdateImage(imageId);
        }
      }

      // Add new images
      if (input.images && input.images.length > 0) {
        for (const image of input.images) {
          const { contentType, buffer } = imageDataUrlToBuffer(image.dataUrl);
          if (!contentType.startsWith("image/")) {
            throw new Error("Only image uploads are supported");
          }

          const stored = await storagePut(
            `projects/${project.id}/updates/${input.updateId}/${safeImageFileName(image.fileName)}`,
            buffer,
            image.contentType || contentType,
          );

          await createUpdateImage({
            updateId: input.updateId,
            imageUrl: stored.url,
            imageKey: stored.url,
          });
        }
      }

      return { success: true };
    }),

  // Admin: Delete project update (owner only)
  deleteUpdate: adminProcedure
    .input(z.object({ updateId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const update = await getProjectUpdateById(input.updateId);
      if (!update) throw new Error("Update not found");
      const project = await getProjectById(update.projectId);
      if (!project) throw new Error("Project not found");
      if (project.ownerId !== ctx.user.id) throw new Error("Unauthorized");
      await deleteProjectUpdate(input.updateId);
      return { success: true };
    }),

  // Client: Get project updates with images
  getUpdates: publicProcedure
    .input(z.object({ accessCode: z.string() }))
    .query(async ({ input }) => {
      const project = await getProjectByAccessCode(input.accessCode);
      if (!project) throw new Error("Invalid access code");

      const updates = await getProjectUpdates(project.id);
      const updatesWithImages = await Promise.all(
        updates.map(async (update) => {
          const images = await getUpdateImages(update.id);
          return { ...update, images };
        })
      );

      return updatesWithImages;
    }),

  // Public: Verify access code (for validation)
  verifyAccessCode: publicProcedure
    .input(z.object({ accessCode: z.string() }))
    .query(async ({ input }) => {
      const project = await getProjectByAccessCode(input.accessCode);
      if (!project) return { valid: false };
      return { valid: true, projectName: project.name };
    }),
});

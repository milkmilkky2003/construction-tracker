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
  createProjectUpdate,
  deleteProjectUpdate,
  createUpdateImage,
  getUpdateImages,
} from "../db";
import { nanoid } from "nanoid";

const generateAccessCode = () => nanoid(8).toUpperCase();

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
        imageUrls: z.array(z.string()), // Pre-uploaded image URLs from storage
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await getProjectById(input.projectId);
      if (!project) throw new Error("Project not found");
      if (project.ownerId !== ctx.user.id) throw new Error("Unauthorized");

      // Create project update
      const updateResult = await createProjectUpdate({
        projectId: input.projectId,
        category: input.category,
        description: input.description,
        uploadedAt: new Date(),
      });

      const updateId = (updateResult as any).insertId;

      // Create image records for pre-uploaded images
      for (const imageUrl of input.imageUrls) {
        await createUpdateImage({
          updateId,
          imageUrl,
          imageKey: imageUrl, // Use URL as key for reference
        });
      }

      return { success: true, updateId };
    }),

  // Admin: Delete project update (owner only)
  deleteUpdate: adminProcedure
    .input(z.object({ updateId: z.number() }))
    .mutation(async ({ input }) => {
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

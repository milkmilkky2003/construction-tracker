import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { projectsRouter } from "./routers/projects";
import { z } from "zod";
import { getAdminByUsername } from "./db";
import bcrypt from "bcryptjs";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    adminLogin: publicProcedure
      .input(z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const admin = await getAdminByUsername(input.username);
        if (!admin) {
          throw new Error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        }

        const passwordMatch = await bcrypt.compare(input.password, admin.passwordHash);
        if (!passwordMatch) {
          throw new Error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        }

        // Set admin session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, JSON.stringify({ adminId: admin.id, username: admin.username }), cookieOptions);

        return {
          success: true,
          adminId: admin.id,
          username: admin.username,
        };
      }),
  }),
  projects: projectsRouter,
});

export type AppRouter = typeof appRouter;

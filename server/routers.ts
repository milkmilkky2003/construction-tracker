import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { projectsRouter } from "./routers/projects";
import { z } from "zod";
import { getAdminByUsername, upsertUser } from "./db";
import bcrypt from "bcryptjs";
import { sdk } from "./_core/sdk";
import { ENV } from "./_core/env";
import type { Request, Response } from "express";

const INVALID_LOGIN_MESSAGE = "Invalid username or password";

async function setLocalAdminSession(
  ctx: { req: Request; res: Response },
  username: string
) {
  const openId = ENV.adminOpenId;

  await upsertUser({
    openId,
    name: username,
    loginMethod: "local-admin",
    role: "admin",
    lastSignedIn: new Date(),
  });

  const sessionToken = await sdk.signSession(
    {
      openId,
      appId: ENV.appId || "local-admin",
      name: username,
    },
    { expiresInMs: ONE_YEAR_MS }
  );

  const cookieOptions = getSessionCookieOptions(ctx.req);
  ctx.res.cookie(COOKIE_NAME, sessionToken, {
    ...cookieOptions,
    maxAge: ONE_YEAR_MS,
  });
}

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
      .input(
        z.object({
          username: z.string().min(1),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (
          input.username === ENV.adminUsername &&
          input.password === ENV.adminPassword
        ) {
          await setLocalAdminSession(ctx, input.username);
          return {
            success: true,
            username: input.username,
          };
        }

        const admin = await getAdminByUsername(input.username);
        if (!admin) {
          throw new Error(INVALID_LOGIN_MESSAGE);
        }

        const passwordMatch = await bcrypt.compare(
          input.password,
          admin.passwordHash
        );
        if (!passwordMatch) {
          throw new Error(INVALID_LOGIN_MESSAGE);
        }

        await setLocalAdminSession(ctx, admin.username);

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

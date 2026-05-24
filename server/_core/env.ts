import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? (isProduction ? "" : "local-dev-jwt-secret"),
  databaseUrl: process.env.DATABASE_URL ?? "",
  adminUserId: Number(process.env.ADMIN_USER_ID ?? "1"),
  adminUsername: process.env.ADMIN_USERNAME ?? (isProduction ? "" : "admin"),
  adminPassword: process.env.ADMIN_PASSWORD ?? (isProduction ? "" : "admin123"),
  adminOpenId: "local-admin",
  appId: "local-app",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "project-images",
  isProduction,
};

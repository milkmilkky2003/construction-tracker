-- Drop old MySQL tables
DROP TABLE IF EXISTS `update_images` CASCADE;
DROP TABLE IF EXISTS `project_updates` CASCADE;
DROP TABLE IF EXISTS `projects` CASCADE;
DROP TABLE IF EXISTS `admin_credentials` CASCADE;
DROP TABLE IF EXISTS `users` CASCADE;

-- Create PostgreSQL tables
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  "loginMethod" VARCHAR(64),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "lastSignedIn" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_credentials (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  "passwordHash" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  "ownerId" INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  "startDate" TIMESTAMP,
  "endDate" TIMESTAMP,
  "accessCode" VARCHAR(12) NOT NULL UNIQUE,
  "progressPercentage" NUMERIC(5,2) NOT NULL DEFAULT 0,
  "structureProgress" NUMERIC(5,2) NOT NULL DEFAULT 0,
  "systemsProgress" NUMERIC(5,2) NOT NULL DEFAULT 0,
  "interiorProgress" NUMERIC(5,2) NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE project_updates (
  id SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  "uploadedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE update_images (
  id SERIAL PRIMARY KEY,
  "updateId" INTEGER NOT NULL,
  "imageUrl" VARCHAR(512) NOT NULL,
  "imageKey" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert admin credentials (password hash for "admin123")
INSERT INTO admin_credentials (username, "passwordHash") VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/DiO');

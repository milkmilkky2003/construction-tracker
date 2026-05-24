ALTER TABLE "projects" ADD COLUMN "hasStructure" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "hasSystems" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "hasInterior" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "structureWeight" integer DEFAULT 33;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "systemsWeight" integer DEFAULT 33;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "interiorWeight" integer DEFAULT 34;
-- Add source column distinguishing campus drives from scraped external jobs
ALTER TABLE "Job" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'campus';

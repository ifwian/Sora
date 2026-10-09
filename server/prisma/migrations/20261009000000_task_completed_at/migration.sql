-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "completedAt" TIMESTAMP(3);

-- Backfill: tasks already completed get their last-updated time as the best available completion time.
UPDATE "tasks" SET "completedAt" = "updatedAt" WHERE "status" = 'COMPLETED' AND "completedAt" IS NULL;

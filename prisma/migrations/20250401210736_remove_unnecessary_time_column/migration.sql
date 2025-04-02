/*
  Warnings:

  - You are about to drop the column `time` on the `History` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "History_userId_time_idx";

-- AlterTable
ALTER TABLE "History" DROP COLUMN "time";

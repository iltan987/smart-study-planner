/*
  Warnings:

  - You are about to drop the column `contentId` on the `History` table. All the data in the column will be lost.
  - You are about to drop the `Content` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FunctionCallContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FunctionResponseContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TextContent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'FUNCTION';
ALTER TYPE "Role" ADD VALUE 'SYSTEM';

-- DropForeignKey
ALTER TABLE "FunctionCallContent" DROP CONSTRAINT "FunctionCallContent_contentId_fkey";

-- DropForeignKey
ALTER TABLE "FunctionResponseContent" DROP CONSTRAINT "FunctionResponseContent_contentId_fkey";

-- DropForeignKey
ALTER TABLE "History" DROP CONSTRAINT "History_contentId_fkey";

-- DropForeignKey
ALTER TABLE "TextContent" DROP CONSTRAINT "TextContent_contentId_fkey";

-- DropIndex
DROP INDEX "History_contentId_key";

-- AlterTable
ALTER TABLE "History" DROP COLUMN "contentId",
ADD COLUMN     "args" JSONB DEFAULT '{}',
ADD COLUMN     "name" TEXT,
ADD COLUMN     "response" JSONB DEFAULT '{}',
ADD COLUMN     "text" TEXT,
ADD COLUMN     "type" "ContentType" NOT NULL,
ALTER COLUMN "role" DROP NOT NULL,
ALTER COLUMN "role" DROP DEFAULT;

-- DropTable
DROP TABLE "Content";

-- DropTable
DROP TABLE "FunctionCallContent";

-- DropTable
DROP TABLE "FunctionResponseContent";

-- DropTable
DROP TABLE "TextContent";

-- DropEnum
DROP TYPE "HistoryRole";

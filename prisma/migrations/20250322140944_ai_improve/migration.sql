/*
  Warnings:

  - You are about to drop the column `content` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `owner` on the `History` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contentId]` on the table `History` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contentId` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MODEL');

-- CreateEnum
CREATE TYPE "HistoryRole" AS ENUM ('USER', 'MODEL');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('TEXT', 'FUNCTION_CALL', 'FUNCTION_RESPONSE');

-- AlterEnum
ALTER TYPE "Language" ADD VALUE 'FA';

-- AlterTable
ALTER TABLE "History" DROP COLUMN "content",
DROP COLUMN "owner",
ADD COLUMN     "contentId" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ALTER COLUMN "time" SET DEFAULT CURRENT_TIMESTAMP;

-- DropEnum
DROP TYPE "OwnerType";

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextContent" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,

    CONSTRAINT "TextContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionCallContent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "args" JSONB NOT NULL,
    "contentId" TEXT NOT NULL,

    CONSTRAINT "FunctionCallContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionResponseContent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "contentId" TEXT NOT NULL,

    CONSTRAINT "FunctionResponseContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TextContent_contentId_key" ON "TextContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "FunctionCallContent_contentId_key" ON "FunctionCallContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "FunctionResponseContent_contentId_key" ON "FunctionResponseContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "History_contentId_key" ON "History"("contentId");

-- CreateIndex
CREATE INDEX "History_userId_time_idx" ON "History"("userId", "time");

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextContent" ADD CONSTRAINT "TextContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunctionCallContent" ADD CONSTRAINT "FunctionCallContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunctionResponseContent" ADD CONSTRAINT "FunctionResponseContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

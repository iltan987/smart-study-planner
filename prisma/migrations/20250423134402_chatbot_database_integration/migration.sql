/*
  Warnings:

  - You are about to drop the column `content` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `owner` on the `History` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[textContentId]` on the table `History` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[functionCallContentId]` on the table `History` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[functionResponseContentId]` on the table `History` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('text', 'function_call', 'function_response');

-- CreateEnum
CREATE TYPE "TextContentRole" AS ENUM ('user', 'model');

-- AlterEnum
ALTER TYPE "Language" ADD VALUE 'FA';

-- AlterTable
ALTER TABLE "History" DROP COLUMN "content",
DROP COLUMN "owner",
ADD COLUMN     "functionCallContentId" TEXT,
ADD COLUMN     "functionResponseContentId" TEXT,
ADD COLUMN     "textContentId" TEXT,
ADD COLUMN     "type" "ContentType" NOT NULL,
ALTER COLUMN "time" SET DEFAULT CURRENT_TIMESTAMP;

-- DropEnum
DROP TYPE "OwnerType";

-- CreateTable
CREATE TABLE "TextContent" (
    "id" TEXT NOT NULL,
    "role" "TextContentRole" NOT NULL,
    "text" TEXT NOT NULL,
    "timeSent" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TextContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionCallContent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "args" JSONB NOT NULL,

    CONSTRAINT "FunctionCallContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionResponseContent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "response" JSONB NOT NULL,

    CONSTRAINT "FunctionResponseContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "History_textContentId_key" ON "History"("textContentId");

-- CreateIndex
CREATE UNIQUE INDEX "History_functionCallContentId_key" ON "History"("functionCallContentId");

-- CreateIndex
CREATE UNIQUE INDEX "History_functionResponseContentId_key" ON "History"("functionResponseContentId");

-- CreateIndex
CREATE INDEX "History_type_idx" ON "History"("type");

-- CreateIndex
CREATE INDEX "History_time_idx" ON "History"("time");

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_textContentId_fkey" FOREIGN KEY ("textContentId") REFERENCES "TextContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_functionCallContentId_fkey" FOREIGN KEY ("functionCallContentId") REFERENCES "FunctionCallContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_functionResponseContentId_fkey" FOREIGN KEY ("functionResponseContentId") REFERENCES "FunctionResponseContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

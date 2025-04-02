/*
  Warnings:

  - You are about to drop the column `args` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `response` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `History` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "History" DROP COLUMN "args",
DROP COLUMN "name",
DROP COLUMN "response",
DROP COLUMN "role",
DROP COLUMN "text",
DROP COLUMN "type";

-- DropEnum
DROP TYPE "ContentType";

-- CreateTable
CREATE TABLE "TextContent" (
    "contentId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "text" TEXT NOT NULL,

    CONSTRAINT "TextContent_pkey" PRIMARY KEY ("contentId")
);

-- CreateTable
CREATE TABLE "FunctionCallContent" (
    "contentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "args" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "FunctionCallContent_pkey" PRIMARY KEY ("contentId")
);

-- CreateTable
CREATE TABLE "FunctionResponseContent" (
    "contentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "response" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "FunctionResponseContent_pkey" PRIMARY KEY ("contentId")
);

-- AddForeignKey
ALTER TABLE "TextContent" ADD CONSTRAINT "TextContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "History"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunctionCallContent" ADD CONSTRAINT "FunctionCallContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "History"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunctionResponseContent" ADD CONSTRAINT "FunctionResponseContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "History"("id") ON DELETE CASCADE ON UPDATE CASCADE;

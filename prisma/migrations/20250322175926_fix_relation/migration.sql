-- DropForeignKey
ALTER TABLE "FunctionCallContent" DROP CONSTRAINT "FunctionCallContent_contentId_fkey";

-- DropForeignKey
ALTER TABLE "FunctionResponseContent" DROP CONSTRAINT "FunctionResponseContent_contentId_fkey";

-- DropForeignKey
ALTER TABLE "TextContent" DROP CONSTRAINT "TextContent_contentId_fkey";

-- AddForeignKey
ALTER TABLE "TextContent" ADD CONSTRAINT "TextContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunctionCallContent" ADD CONSTRAINT "FunctionCallContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunctionResponseContent" ADD CONSTRAINT "FunctionResponseContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

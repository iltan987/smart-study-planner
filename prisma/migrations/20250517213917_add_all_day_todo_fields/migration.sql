-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "isAllDay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "date" DATE,
ALTER COLUMN "dueTime" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Todo_userId_date_isAllDay_idx" ON "Todo"("userId", "date", "isAllDay");

-- CreateIndex
CREATE INDEX "Todo_userId_priority_date_isAllDay_idx" ON "Todo"("userId", "priority", "date", "isAllDay");

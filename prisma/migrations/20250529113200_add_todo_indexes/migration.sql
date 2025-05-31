-- CreateIndex
CREATE INDEX "Todo_userId_date_idx" ON "Todo"("userId", "date");

-- CreateIndex
CREATE INDEX "Todo_userId_dueTime_idx" ON "Todo"("userId", "dueTime");

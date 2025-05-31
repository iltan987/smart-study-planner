-- CreateIndex
CREATE INDEX "CalendarEvent_userId_start_end_idx" ON "CalendarEvent"("userId", "start", "end");

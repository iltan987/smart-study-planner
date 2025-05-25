-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ENGLISH', 'TURKISH', 'PERSIAN');

-- CreateEnum
CREATE TYPE "TodoPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TodoCategory" AS ENUM ('STUDY', 'ASSIGNMENT', 'EXAM', 'WORK', 'GYM', 'OTHER');

-- CreateEnum
CREATE TYPE "TodoStatus" AS ENUM ('PENDING', 'COMPLETED', 'MISSED');

-- CreateEnum
CREATE TYPE "AiInteractionContentType" AS ENUM ('USER_INPUT_MESSAGE', 'MODEL_RESPONSE_MESSAGE', 'FUNCTION_CALL_REQUEST', 'FUNCTION_CALL_RESULT');

-- CreateEnum
CREATE TYPE "MessageRating" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notificationsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "birthday" TIMESTAMP(3),
    "gender" "Gender",
    "language" "Language",
    "school" TEXT,
    "degree" TEXT,
    "fieldOfStudy" TEXT,
    "educationStartDate" TIMESTAMP(3),
    "isFinished" BOOLEAN DEFAULT false,
    "finishDate" TIMESTAMP(3),
    "estimatedFinishDate" TIMESTAMP(3),
    "gpa" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Todo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueTime" TIMESTAMP(3) NOT NULL,
    "priority" "TodoPriority" NOT NULL DEFAULT 'MEDIUM',
    "category" "TodoCategory" NOT NULL DEFAULT 'STUDY',
    "duration" INTEGER,
    "status" "TodoStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiInteractionEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "AiInteractionContentType" NOT NULL,
    "userInputMessageId" TEXT,
    "modelResponseMessageId" TEXT,
    "functionCallRequestId" TEXT,
    "functionCallResultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiInteractionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInputMessage" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "UserInputMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelResponseMessage" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "rating" "MessageRating",

    CONSTRAINT "ModelResponseMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiFunctionCallRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "args" JSONB NOT NULL,

    CONSTRAINT "AiFunctionCallRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiFunctionCallResult" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "response" JSONB NOT NULL,

    CONSTRAINT "AiFunctionCallResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "Todo_userId_dueTime_idx" ON "Todo"("userId", "dueTime");

-- CreateIndex
CREATE INDEX "Todo_userId_status_idx" ON "Todo"("userId", "status");

-- CreateIndex
CREATE INDEX "Todo_userId_priority_dueTime_idx" ON "Todo"("userId", "priority", "dueTime");

-- CreateIndex
CREATE INDEX "CalendarEvent_userId_startTime_endTime_idx" ON "CalendarEvent"("userId", "startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "AiInteractionEvent_userInputMessageId_key" ON "AiInteractionEvent"("userInputMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "AiInteractionEvent_modelResponseMessageId_key" ON "AiInteractionEvent"("modelResponseMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "AiInteractionEvent_functionCallRequestId_key" ON "AiInteractionEvent"("functionCallRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "AiInteractionEvent_functionCallResultId_key" ON "AiInteractionEvent"("functionCallResultId");

-- CreateIndex
CREATE INDEX "AiInteractionEvent_userId_timestamp_idx" ON "AiInteractionEvent"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "AiInteractionEvent_type_idx" ON "AiInteractionEvent"("type");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInteractionEvent" ADD CONSTRAINT "AiInteractionEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInteractionEvent" ADD CONSTRAINT "AiInteractionEvent_userInputMessageId_fkey" FOREIGN KEY ("userInputMessageId") REFERENCES "UserInputMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInteractionEvent" ADD CONSTRAINT "AiInteractionEvent_modelResponseMessageId_fkey" FOREIGN KEY ("modelResponseMessageId") REFERENCES "ModelResponseMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInteractionEvent" ADD CONSTRAINT "AiInteractionEvent_functionCallRequestId_fkey" FOREIGN KEY ("functionCallRequestId") REFERENCES "AiFunctionCallRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInteractionEvent" ADD CONSTRAINT "AiInteractionEvent_functionCallResultId_fkey" FOREIGN KEY ("functionCallResultId") REFERENCES "AiFunctionCallResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

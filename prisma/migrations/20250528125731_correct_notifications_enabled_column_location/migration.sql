/*
  Warnings:

  - You are about to drop the column `notificationsEnabled` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "notificationsEnabled";

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "notificationsEnabled" BOOLEAN NOT NULL DEFAULT false;

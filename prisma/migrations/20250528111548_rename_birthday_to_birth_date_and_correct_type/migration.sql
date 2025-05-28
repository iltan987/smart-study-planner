/*
  Warnings:

  - You are about to drop the column `birthday` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "birthday",
ADD COLUMN     "birthDate" DATE;

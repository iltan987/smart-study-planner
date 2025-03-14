/*
  Warnings:

  - The values [user,model] on the enum `OwnerType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'TR');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "OwnerType_new" AS ENUM ('USER', 'MODEL');
ALTER TABLE "History" ALTER COLUMN "owner" DROP DEFAULT;
ALTER TABLE "History" ALTER COLUMN "owner" TYPE "OwnerType_new" USING ("owner"::text::"OwnerType_new");
ALTER TYPE "OwnerType" RENAME TO "OwnerType_old";
ALTER TYPE "OwnerType_new" RENAME TO "OwnerType";
DROP TYPE "OwnerType_old";
ALTER TABLE "History" ALTER COLUMN "owner" SET DEFAULT 'USER';
COMMIT;

-- AlterTable
ALTER TABLE "History" ALTER COLUMN "owner" SET DEFAULT 'USER';

-- CreateTable
CREATE TABLE "Profile" (
    "gender" "Gender",
    "dob" DATE,
    "language" "Language" NOT NULL DEFAULT 'EN',
    "userId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "EducationInfo" (
    "id" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "start" DATE NOT NULL,
    "gpa" DOUBLE PRECISION NOT NULL,
    "profileUserId" TEXT NOT NULL,

    CONSTRAINT "EducationInfo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationInfo" ADD CONSTRAINT "EducationInfo_profileUserId_fkey" FOREIGN KEY ("profileUserId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

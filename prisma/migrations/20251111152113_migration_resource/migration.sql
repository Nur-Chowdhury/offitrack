-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('PHYSICAL', 'VIRTUAL');

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "location" TEXT,
ADD COLUMN     "type" "ResourceType" NOT NULL DEFAULT 'PHYSICAL',
ADD COLUMN     "url" TEXT;

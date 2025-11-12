-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "MaintenanceLog" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "resourceId" TEXT,
ALTER COLUMN "cost" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "condition" "AssetCondition" NOT NULL DEFAULT 'GOOD';

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

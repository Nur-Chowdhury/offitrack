-- DropForeignKey
ALTER TABLE "MaintenanceLog" DROP CONSTRAINT "MaintenanceLog_assetId_fkey";

-- AlterTable
ALTER TABLE "MaintenanceLog" ALTER COLUMN "assetId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "warrantyExpiry" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OrganizationMembership" ADD COLUMN     "lastSeenNotificationsAt" TIMESTAMP(3);

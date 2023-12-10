-- DropForeignKey
ALTER TABLE `Donation` DROP FOREIGN KEY `Donation_actionId_fkey`;

-- AlterTable
ALTER TABLE `Donation` MODIFY `actionId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Donation` ADD CONSTRAINT `Donation_actionId_fkey` FOREIGN KEY (`actionId`) REFERENCES `Action`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

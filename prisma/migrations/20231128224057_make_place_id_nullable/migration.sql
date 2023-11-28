-- DropForeignKey
ALTER TABLE `Action` DROP FOREIGN KEY `Action_placeId_fkey`;

-- AlterTable
ALTER TABLE `Action` MODIFY `placeId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Action` ADD CONSTRAINT `Action_placeId_fkey` FOREIGN KEY (`placeId`) REFERENCES `Place`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

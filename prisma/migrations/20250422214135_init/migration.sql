/*
  Warnings:

  - You are about to drop the column `borrower_id` on the `loans` table. All the data in the column will be lost.
  - You are about to drop the `borrowers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `loans` table without a default value. This is not possible if the table is not empty.
  - Made the column `first_name` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `last_name` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "loans" DROP CONSTRAINT "loans_borrower_id_fkey";

-- AlterTable
ALTER TABLE "loans" DROP COLUMN "borrower_id",
ADD COLUMN     "approved_by_customer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "approved_by_us" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "credit_score" INTEGER,
ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_agent" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "first_name" SET NOT NULL,
ALTER COLUMN "last_name" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "borrowers";

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

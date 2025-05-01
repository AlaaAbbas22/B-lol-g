-- AlterTable
ALTER TABLE "PostView" ADD COLUMN "ipAddress" TEXT;
ALTER TABLE "PostView" ADD COLUMN "visitorHash" TEXT;

-- CreateIndex
CREATE INDEX "PostView_visitorHash_idx" ON "PostView"("visitorHash");

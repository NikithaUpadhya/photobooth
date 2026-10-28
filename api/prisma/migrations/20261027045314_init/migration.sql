-- CreateTable
CREATE TABLE "Strip" (
    "id" VARCHAR(16) NOT NULL,
    "caption" VARCHAR(24),
    "frameColor" CHAR(7) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Strip_pkey" PRIMARY KEY ("id")
);

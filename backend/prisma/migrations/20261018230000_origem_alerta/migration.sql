-- CreateEnum
CREATE TYPE "OrigemAlerta" AS ENUM ('MANUAL', 'PREVISAO');

-- AlterTable
ALTER TABLE "AlertaClimatico" ADD COLUMN     "origem" "OrigemAlerta" NOT NULL DEFAULT 'MANUAL';

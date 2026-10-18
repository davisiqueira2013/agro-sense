-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('ADMIN', 'TECNICO', 'LEITOR');

-- CreateEnum
CREATE TYPE "StatusTalhao" AS ENUM ('EM_PREPARO', 'ATIVO', 'COLHIDO');

-- CreateEnum
CREATE TYPE "TipoAtividade" AS ENUM ('PLANTIO', 'PULVERIZACAO', 'ADUBACAO', 'COLHEITA', 'IRRIGACAO');

-- CreateEnum
CREATE TYPE "StatusAtividade" AS ENUM ('AGENDADA', 'EM_ANDAMENTO', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "CategoriaRegistro" AS ENUM ('PRAGAS', 'SOLO', 'CLIMA', 'DOENCAS', 'GERAL');

-- CreateEnum
CREATE TYPE "CategoriaInsumo" AS ENUM ('SEMENTES', 'FERTILIZANTES', 'DEFENSIVOS', 'COMBUSTIVEL');

-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateEnum
CREATE TYPE "TipoAlerta" AS ENUM ('GEADA', 'CHUVA_INTENSA', 'VENTO_FORTE');

-- CreateEnum
CREATE TYPE "Severidade" AS ENUM ('CRITICO', 'ATENCAO', 'AVISO');

-- CreateEnum
CREATE TYPE "TipoRelatorio" AS ENUM ('CUSTOS', 'ATIVIDADES', 'ESTOQUE');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL DEFAULT 'TECNICO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Talhao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "cultura" TEXT NOT NULL,
    "areaHa" DOUBLE PRECISION NOT NULL,
    "status" "StatusTalhao" NOT NULL DEFAULT 'EM_PREPARO',
    "temperaturaAtual" DOUBLE PRECISION,
    "umidadeAtual" DOUBLE PRECISION,
    "climaAtualizadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Talhao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Atividade" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoAtividade" NOT NULL,
    "dataPrevista" TIMESTAMP(3) NOT NULL,
    "dataConclusao" TIMESTAMP(3),
    "status" "StatusAtividade" NOT NULL DEFAULT 'AGENDADA',
    "observacao" TEXT,
    "talhaoId" INTEGER NOT NULL,
    "responsavelId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Atividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroDiario" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "categoria" "CategoriaRegistro" NOT NULL DEFAULT 'GERAL',
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autorId" INTEGER NOT NULL,
    "talhaoId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroDiario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insumo" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" "CategoriaInsumo" NOT NULL,
    "unidade" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estoqueMinimo" DOUBLE PRECISION NOT NULL,
    "custoUnitario" DECIMAL(12,2) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Insumo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimentacao" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoMovimentacao" NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "custoUnitario" DECIMAL(12,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "insumoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "atividadeId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movimentacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertaClimatico" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoAlerta" NOT NULL,
    "severidade" "Severidade" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertaClimatico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relatorio" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoRelatorio" NOT NULL,
    "titulo" TEXT NOT NULL,
    "periodoInicio" TIMESTAMP(3) NOT NULL,
    "periodoFim" TIMESTAMP(3) NOT NULL,
    "arquivo" TEXT NOT NULL,
    "tamanhoBytes" INTEGER NOT NULL,
    "geradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geradoPorId" INTEGER NOT NULL,

    CONSTRAINT "Relatorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AlertaClimaticoToTalhao" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AlertaClimaticoToTalhao_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Talhao_nome_key" ON "Talhao"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Insumo_nome_key" ON "Insumo"("nome");

-- CreateIndex
CREATE INDEX "_AlertaClimaticoToTalhao_B_index" ON "_AlertaClimaticoToTalhao"("B");

-- AddForeignKey
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "Talhao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroDiario" ADD CONSTRAINT "RegistroDiario_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroDiario" ADD CONSTRAINT "RegistroDiario_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "Talhao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_atividadeId_fkey" FOREIGN KEY ("atividadeId") REFERENCES "Atividade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relatorio" ADD CONSTRAINT "Relatorio_geradoPorId_fkey" FOREIGN KEY ("geradoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlertaClimaticoToTalhao" ADD CONSTRAINT "_AlertaClimaticoToTalhao_A_fkey" FOREIGN KEY ("A") REFERENCES "AlertaClimatico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlertaClimaticoToTalhao" ADD CONSTRAINT "_AlertaClimaticoToTalhao_B_fkey" FOREIGN KEY ("B") REFERENCES "Talhao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

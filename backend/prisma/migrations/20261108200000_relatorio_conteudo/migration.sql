-- RN12: o PDF do relatório passa a ser guardado no banco.
-- Até esta versão nenhum relatório era gravado (a tela usava dados de exemplo),
-- então a tabela é esvaziada antes de criar a coluna obrigatória.
DELETE FROM "Relatorio";

-- AlterTable
ALTER TABLE "Relatorio" ADD COLUMN     "conteudo" BYTEA NOT NULL;

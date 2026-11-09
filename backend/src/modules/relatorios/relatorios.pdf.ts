import PDFDocument from 'pdfkit';

// Montagem do PDF dos relatórios (RN12) com PDFKit.
// Usa as fontes padrão do PDF (Helvetica), que já suportam acentos do português.

const VERDE = '#2E7D32';
const CINZA = '#555555';
const LINHA = '#DDDDDD';
const FUNDO_CABECALHO = '#E8F5E9';
const FUNDO_ALTERNADO = '#F7F7F7';

export type Coluna = { titulo: string; largura: number; alinhar?: 'left' | 'right' | 'center' };
export type Indicador = { rotulo: string; valor: string };

export type ConteudoRelatorio = {
  titulo: string;
  periodo: string;
  geradoPor: string;
  geradoEm: string;
  indicadores: Indicador[];
  secoes: { titulo: string; colunas: Coluna[]; linhas: string[][]; vazio: string; rodape?: string[] }[];
  observacao?: string;
};

/** Gera o PDF em memória e devolve o Buffer. */
export function montarPdf(conteudo: ConteudoRelatorio): Promise<Buffer> {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 60, left: 50, right: 50 },
    bufferPages: true,
    info: { Title: conteudo.titulo, Author: 'Agro Sense', Subject: conteudo.periodo, Creator: 'Agro Sense API' },
  });

  const partes: Buffer[] = [];
  doc.on('data', (parte: Buffer) => partes.push(parte));
  const pronto = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(partes)));
    doc.on('error', reject);
  });

  const esquerda = doc.page.margins.left;
  const largura = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const limiteInferior = () => doc.page.height - doc.page.margins.bottom;

  // ---------- Cabeçalho ----------
  doc.rect(0, 0, doc.page.width, 8).fill(VERDE);
  doc.fillColor(VERDE).font('Helvetica-Bold').fontSize(11).text('AGRO SENSE', esquerda, 28);
  doc.fillColor('#000000').fontSize(18).text(conteudo.titulo, esquerda, 46, { width: largura });
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(9.5).fillColor(CINZA);
  doc.text(`Período: ${conteudo.periodo}`);
  doc.text(`Gerado em ${conteudo.geradoEm} por ${conteudo.geradoPor}`);
  doc.moveDown(0.6);
  doc.moveTo(esquerda, doc.y).lineTo(esquerda + largura, doc.y).strokeColor(LINHA).lineWidth(1).stroke();
  doc.moveDown(0.8);

  // ---------- Indicadores (caixas lado a lado) ----------
  if (conteudo.indicadores.length) {
    const porLinha = Math.min(conteudo.indicadores.length, 4);
    const espaco = 8;
    const larguraCaixa = (largura - espaco * (porLinha - 1)) / porLinha;
    const alturaCaixa = 46;
    conteudo.indicadores.forEach((indicador, i) => {
      if (i > 0 && i % porLinha === 0) doc.y += alturaCaixa + espaco;
      const x = esquerda + (i % porLinha) * (larguraCaixa + espaco);
      const y = doc.y;
      doc.roundedRect(x, y, larguraCaixa, alturaCaixa, 4).fillAndStroke(FUNDO_CABECALHO, '#C8E6C9');
      doc.fillColor(CINZA).font('Helvetica').fontSize(7.5).text(indicador.rotulo.toUpperCase(), x + 8, y + 8, { width: larguraCaixa - 16 });
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(12.5).text(indicador.valor, x + 8, y + 22, { width: larguraCaixa - 16 });
      doc.y = y;
    });
    doc.y += alturaCaixa + 18;
    doc.x = esquerda;
  }

  // ---------- Seções com tabela ----------
  for (const secao of conteudo.secoes) {
    if (doc.y + 60 > limiteInferior()) doc.addPage();
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(12).text(secao.titulo, esquerda, doc.y);
    doc.moveDown(0.4);
    if (secao.linhas.length === 0) {
      doc.font('Helvetica-Oblique').fontSize(9.5).fillColor(CINZA).text(secao.vazio, esquerda);
      doc.moveDown(1.2);
      continue;
    }
    desenharTabela(doc, secao.colunas, secao.linhas, secao.rodape, esquerda, largura, limiteInferior);
    doc.moveDown(1.2);
  }

  if (conteudo.observacao) {
    if (doc.y + 40 > limiteInferior()) doc.addPage();
    doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(CINZA).text(conteudo.observacao, esquerda, doc.y, { width: largura });
  }

  // ---------- Rodapé com numeração ----------
  const paginas = doc.bufferedPageRange();
  for (let i = 0; i < paginas.count; i++) {
    doc.switchToPage(paginas.start + i);
    const y = doc.page.height - 40;
    // Escrever abaixo da margem inferior exige zerá-la temporariamente (senão o PDFKit cria página nova).
    const margemInferior = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.font('Helvetica').fontSize(8).fillColor(CINZA);
    doc.text(`Agro Sense · ${conteudo.titulo}`, esquerda, y, { width: largura / 2, lineBreak: false });
    doc.text(`Página ${i + 1} de ${paginas.count}`, esquerda + largura / 2, y, { width: largura / 2, align: 'right', lineBreak: false });
    doc.page.margins.bottom = margemInferior;
  }

  doc.end();
  return pronto;
}

function desenharTabela(
  doc: PDFKit.PDFDocument,
  colunas: Coluna[],
  linhas: string[][],
  rodape: string[] | undefined,
  esquerda: number,
  largura: number,
  limiteInferior: () => number,
) {
  const total = colunas.reduce((soma, c) => soma + c.largura, 0);
  const larguras = colunas.map((c) => (c.largura / total) * largura);
  const padding = 4;
  const tamanhoFonte = 8.5;

  const alturaDaLinha = (celulas: string[], fonte: string) => {
    doc.font(fonte).fontSize(tamanhoFonte);
    return Math.max(...celulas.map((texto, i) => doc.heightOfString(texto, { width: larguras[i] - padding * 2 }))) + padding * 2;
  };

  const desenharLinha = (celulas: string[], fonte: string, fundo?: string) => {
    const altura = alturaDaLinha(celulas, fonte);
    if (doc.y + altura > limiteInferior()) {
      doc.addPage();
      desenharLinha(colunas.map((c) => c.titulo), 'Helvetica-Bold', FUNDO_CABECALHO); // repete o cabeçalho
    }
    const y = doc.y;
    if (fundo) doc.rect(esquerda, y, largura, altura).fill(fundo);
    let x = esquerda;
    celulas.forEach((texto, i) => {
      doc.fillColor('#000000').font(fonte).fontSize(tamanhoFonte)
        .text(texto, x + padding, y + padding, { width: larguras[i] - padding * 2, align: colunas[i].alinhar ?? 'left' });
      x += larguras[i];
    });
    doc.moveTo(esquerda, y + altura).lineTo(esquerda + largura, y + altura).strokeColor(LINHA).lineWidth(0.5).stroke();
    doc.y = y + altura;
  };

  desenharLinha(colunas.map((c) => c.titulo), 'Helvetica-Bold', FUNDO_CABECALHO);
  linhas.forEach((linha, i) => desenharLinha(linha, 'Helvetica', i % 2 === 1 ? FUNDO_ALTERNADO : undefined));
  if (rodape) desenharLinha(rodape, 'Helvetica-Bold', FUNDO_CABECALHO);
  doc.x = esquerda;
}
